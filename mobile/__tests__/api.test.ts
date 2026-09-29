/** Query serialisation, error mapping and retry behaviour. */

import { ApiError, api, mediaUrl } from '@/api';
import { buildQuery } from '@/api/client';
import { API } from '@/config';

const mockFetch = global.fetch as jest.Mock;

function ok(body: unknown, status = 200) {
  return { ok: true, status, json: async () => body } as unknown as Response;
}

function fail(status: number, detail: unknown) {
  return {
    ok: false,
    status,
    statusText: 'Error',
    json: async () => ({ detail }),
  } as unknown as Response;
}

beforeEach(() => mockFetch.mockReset());

describe('buildQuery', () => {
  it('repeats the key for array values, as FastAPI expects', () => {
    expect(buildQuery({ season: ['winter', 'spring'] })).toBe('?season=winter&season=spring');
  });

  it('drops empty, null and undefined values', () => {
    expect(buildQuery({ a: null, b: undefined, c: '', d: 0 })).toBe('?d=0');
  });

  it('returns an empty string when nothing survives', () => {
    expect(buildQuery({ a: null })).toBe('');
    expect(buildQuery(undefined)).toBe('');
  });
});

describe('item queries', () => {
  it('omits facets that are not constraining anything', async () => {
    mockFetch.mockResolvedValue(ok({ items: [], total: 0, limit: 40, offset: 0 }));
    await api.items.list({ search: undefined, season: [], gender: ['unisex'] });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('gender=unisex');
    expect(url).not.toContain('season=');
    expect(url).not.toContain('search=');
  });

  it('always sends a page size', async () => {
    mockFetch.mockResolvedValue(ok({ items: [], total: 0, limit: 40, offset: 0 }));
    await api.items.list({});
    expect(mockFetch.mock.calls[0][0]).toContain('limit=');
  });
});

describe('error handling', () => {
  it('surfaces a string detail', async () => {
    mockFetch.mockResolvedValue(fail(404, 'Item 7 not found.'));
    await expect(api.items.read(7)).rejects.toMatchObject({
      status: 404,
      detail: 'Item 7 not found.',
    });
  });

  it('flattens pydantic validation details', async () => {
    mockFetch.mockResolvedValue(fail(422, [{ msg: 'name cannot be blank' }]));
    await expect(api.items.read(1)).rejects.toMatchObject({ detail: 'name cannot be blank' });
  });

  it('does not retry a 4xx', async () => {
    mockFetch.mockResolvedValue(fail(404, 'nope'));
    await expect(api.items.read(1)).rejects.toBeInstanceOf(ApiError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('retries a transport failure, then reports it as a network error', async () => {
    mockFetch.mockRejectedValue(new Error('offline'));
    const error = await api.items.read(1).catch((caught: ApiError) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).isNetworkError).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(API.retries + 1);
  });

  it('recovers when a retry succeeds', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('flaky'))
      .mockResolvedValueOnce(ok({ id: 1, name: 'Coat' }));
    await expect(api.items.read(1)).resolves.toMatchObject({ name: 'Coat' });
  });
});

describe('media urls', () => {
  it('roots a relative path at the API host', () => {
    expect(mediaUrl('/media/a.png')).toBe(`${API.baseUrl}/media/a.png`);
  });

  it('leaves an absolute url alone', () => {
    expect(mediaUrl('https://cdn.example/a.png')).toBe('https://cdn.example/a.png');
  });
});

describe('uploads', () => {
  it('sends one multipart entry per picked file', async () => {
    mockFetch.mockResolvedValue(ok([]));
    await api.items.uploadImages(3, [
      { uri: 'file://a.jpg', mimeType: 'image/jpeg', fileName: 'a.jpg' },
      { uri: 'file://b.png', mimeType: 'image/png', fileName: 'b.png' },
    ]);
    const body = mockFetch.mock.calls[0][1].body as FormData;
    expect(body.getAll('files')).toHaveLength(2);
  });
});
