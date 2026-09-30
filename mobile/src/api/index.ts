/** Endpoint bindings, one function per backend route. */

import { File } from 'expo-file-system';

import { LIMITS } from '@/config';

import { json, upload } from './client';
import type {
  Item,
  ItemDraft,
  ItemImage,
  ItemQuery,
  ItemSummary,
  LibraryStats,
  LocalImage,
  Meta,
  Page,
  Suggestion,
  Vocabulary,
} from './types';

export * from './types';
export { ApiError, mediaUrl } from './client';

/**
 * The shape a multipart file part must have.
 *
 * Expo's `fetch` (which replaces the global one from SDK 54) serialises a
 * part from `name`, `type` and `bytes()`. It deliberately does *not* accept
 * React Native's classic `{uri, name, type}` part — passing one fails with
 * "Unsupported FormDataPart implementation".
 */
export type UploadPart = {
  name: string;
  type: string;
  bytes: () => Promise<Uint8Array>;
};

/**
 * Reconciles the file on disk with what the picker told us.
 *
 * The file system reports an empty mime type when it cannot sniff one, and
 * the backend rejects a part with no content type — so the picker's value
 * wins whenever the file's own is missing.
 */
export function reconcileUploadPart(file: UploadPart, image: LocalImage): UploadPart {
  if (file.name && file.type) return file;
  return {
    name: file.name || image.fileName,
    type: file.type || image.mimeType,
    bytes: () => file.bytes(),
  };
}

/** The multipart parts for a set of picked photos, in order. */
export function imageUploadParts(images: LocalImage[]): UploadPart[] {
  return images.map((image) =>
    // `File` implements Blob and exposes bytes(), which is what Expo's fetch wants.
    reconcileUploadPart(new File(image.uri) as unknown as UploadPart, image),
  );
}

/** Today in the device's own timezone, as an ISO date. */
export function localToday(now: Date = new Date()): string {
  // toISOString() would convert to UTC and can land on the wrong day.
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Strips empty facets so the URL carries only real constraints. */
function queryParams(query: ItemQuery): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined) {
      params[key] = value;
    }
  }
  return params;
}

export const items = {
  list: (query: ItemQuery = {}) =>
    json.get<Page<ItemSummary>>('/items', { limit: LIMITS.pageSize, ...queryParams(query) }),
  read: (id: number) => json.get<Item>(`/items/${id}`),
  create: (draft: ItemDraft) => json.post<Item>('/items', draft),
  update: (id: number, draft: ItemDraft) => json.put<Item>(`/items/${id}`, draft),
  remove: (id: number) => json.delete(`/items/${id}`),

  uploadImages: (id: number, images: LocalImage[]) => {
    const form = new FormData();
    for (const part of imageUploadParts(images)) {
      // The DOM typing insists on a Blob; Expo's serialiser wants `bytes()`.
      form.append('files', part as unknown as Blob);
    }
    return upload<ItemImage[]>(`/items/${id}/images`, form);
  },
  reorderImages: (id: number, imageIds: number[]) =>
    json.put<ItemImage[]>(`/items/${id}/images/order`, { image_ids: imageIds }),
  removeImage: (id: number, imageId: number) => json.delete(`/items/${id}/images/${imageId}`),

  /** Records that the piece was worn; sends the phone's own calendar date. */
  markUsed: (id: number, usedOn: string = localToday()) =>
    json.post<Item>(`/items/${id}/use`, { used_on: usedOn }),
  clearUsed: (id: number) => json.delete(`/items/${id}/use`),

  pairings: (id: number) => json.get<ItemSummary[]>(`/items/${id}/pairings`),
  addPairing: (id: number, partnerId: number) =>
    json.post<ItemSummary[]>(`/items/${id}/pairings`, { item_id: partnerId }),
  removePairing: (id: number, partnerId: number) =>
    json.delete(`/items/${id}/pairings/${partnerId}`),
};

/** Brands and storages expose the same surface; one factory binds both. */
function vocabularyApi(resource: 'brands' | 'storages') {
  return {
    list: (search?: string) => json.get<Vocabulary[]>(`/${resource}`, { search }),
    read: (id: number) => json.get<Vocabulary>(`/${resource}/${id}`),
    suggest: (prefix: string) =>
      json.get<Suggestion[]>(`/${resource}/suggest`, {
        q: prefix,
        limit: LIMITS.autocompleteSuggestions,
      }),
    create: (name: string) => json.post<Vocabulary>(`/${resource}`, { name }),
    rename: (id: number, name: string) => json.put<Vocabulary>(`/${resource}/${id}`, { name }),
    remove: (id: number) => json.delete(`/${resource}/${id}`),
    items: (id: number, query: ItemQuery = {}) =>
      json.get<Page<ItemSummary>>(`/${resource}/${id}/items`, {
        limit: LIMITS.pageSize,
        ...queryParams(query),
      }),
  };
}

export const brands = vocabularyApi('brands');
export const storages = vocabularyApi('storages');

export const catalog = {
  meta: () => json.get<Meta>('/meta'),
  stats: () => json.get<LibraryStats>('/stats'),
};

export const api = { items, brands, storages, catalog };
