/**
 * The multipart parts we build must survive Expo's own serialiser.
 *
 * Expo's `fetch` replaces the global one from SDK 54 and rejects React
 * Native's classic `{uri, name, type}` part with "Unsupported FormDataPart
 * implementation" — the bug this pins. The parts go through the real
 * converter; the entries are supplied directly because the global `FormData`
 * under Jest is Node's, which stringifies anything that is not a Blob and so
 * cannot represent a React Native part at all.
 */

import { convertFormDataAsync } from 'expo/src/winter/fetch/convertFormData';

import { imageUploadParts, reconcileUploadPart, type LocalImage, type UploadPart } from '@/api';

// Stands in for expo-file-system's File, which needs a real file on disk.
jest.mock('expo-file-system', () => ({
  File: class {
    name = 'from-disk.jpg';
    type = 'image/jpeg';
    async bytes() {
      return new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
    }
  },
}));

const IMAGE: LocalImage = {
  uri: 'file:///tmp/shot.jpg',
  mimeType: 'image/jpeg',
  fileName: 'shot.jpg',
};

const BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);

function fakeFile(overrides: Partial<UploadPart> = {}): UploadPart {
  return { name: 'shot.jpg', type: 'image/jpeg', bytes: async () => BYTES, ...overrides };
}

/** Serialises parts exactly as Expo's fetch would, given the runtime's entries. */
async function serialise(parts: unknown[]): Promise<string> {
  const formLike = { entries: () => parts.map((part) => ['files', part]) } as unknown as FormData;
  const { body } = await convertFormDataAsync(formLike, 'BOUNDARY');
  return new TextDecoder().decode(body);
}

describe('reconcileUploadPart', () => {
  it('keeps the file as-is when it knows its own name and type', () => {
    const file = fakeFile();
    expect(reconcileUploadPart(file, IMAGE)).toBe(file);
  });

  it('falls back to the picker type when the file system cannot sniff one', async () => {
    const part = reconcileUploadPart(fakeFile({ type: '' }), IMAGE);
    expect(part.type).toBe('image/jpeg');
    expect(await part.bytes()).toEqual(BYTES);
  });

  it('falls back to the picker filename when the file has none', () => {
    expect(reconcileUploadPart(fakeFile({ name: '' }), IMAGE).name).toBe('shot.jpg');
  });
});

describe('what Expo actually serialises', () => {
  it('accepts our part instead of failing on an unsupported implementation', async () => {
    await expect(serialise(imageUploadParts([IMAGE]))).resolves.toContain('BOUNDARY');
  });

  it('carries a filename, so the backend sees a file and not a text field', async () => {
    expect(await serialise(imageUploadParts([IMAGE]))).toContain('filename=');
  });

  it('carries a content type, which the backend validates before storing', async () => {
    expect(await serialise(imageUploadParts([IMAGE]))).toContain('content-type: image/jpeg');
  });

  it('writes the file bytes into the body', async () => {
    expect(await serialise(imageUploadParts([IMAGE]))).toContain('����');
  });

  /** The exact shape that produced the reported failure. */
  it('rejects the classic React Native {uri, name, type} part', async () => {
    await expect(
      serialise([{ uri: IMAGE.uri, name: 'shot.jpg', type: 'image/jpeg' }]),
    ).rejects.toThrow(/Unsupported FormDataPart/);
  });
});

describe('imageUploadParts', () => {
  it('builds one part per picked photo, in order', () => {
    const parts = imageUploadParts([IMAGE, { ...IMAGE, fileName: 'second.png' }]);
    expect(parts).toHaveLength(2);
    expect(parts.every((part) => typeof part.bytes === 'function')).toBe(true);
  });

  it('serialises a whole batch', async () => {
    const body = await serialise(imageUploadParts([IMAGE, { ...IMAGE, fileName: 'second.png' }]));
    expect(body.match(/content-disposition/g)).toHaveLength(2);
  });
});
