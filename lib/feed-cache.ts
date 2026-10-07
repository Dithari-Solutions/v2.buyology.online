import { feedExpiresAt, FEED_RESTORE_MS } from './feed-policy';

type Entry = { data: unknown; updatedAt: number; persist: boolean };
const entries = new Map<string, Entry>();
const inFlight = new Map<string, Promise<unknown>>();
const STORAGE_KEY = 'buyo_public_feeds_v1';
let restored = false;
let generation = 0;

function restore(): void {
  if (restored || typeof window === 'undefined') return;
  restored = true;
  try {
    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]') as [string, Entry][];
    for (const [key, item] of stored.slice(0, 8)) {
      if (item.persist && feedExpiresAt(item.data, item.updatedAt, FEED_RESTORE_MS) > Date.now()) entries.set(key, item);
    }
  } catch { /* Storage disabled or corrupt: the network still works. */ }
}

export function peekFeed<T>(key: string, allowStale = false): T | undefined {
  if (typeof window === 'undefined') return undefined;
  restore();
  const item = entries.get(key);
  if (!item) return undefined;
  if (feedExpiresAt(item.data, item.updatedAt, allowStale ? FEED_RESTORE_MS : undefined) <= Date.now()) return undefined;
  return item.data as T;
}

function save(): void {
  if (typeof window === 'undefined') return;
  try {
    const publicEntries: [string, Entry][] = [];
    let bytes = 0;
    for (const pair of [...entries].reverse()) {
      const item = pair[1];
      if (!item.persist || feedExpiresAt(item.data, item.updatedAt, FEED_RESTORE_MS) <= Date.now()) continue;
      const size = JSON.stringify(pair).length;
      if (bytes + size > 256_000) continue;
      publicEntries.push(pair);
      bytes += size;
      if (publicEntries.length === 8) break;
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(publicEntries.reverse()));
  } catch { /* Private mode/quota: memory cache remains available. */ }
}

export async function cachedFeed<T>(key: string, load: () => Promise<T>, persist = true): Promise<T> {
  if (typeof window === 'undefined') return load(); // Next owns the server data cache.
  const hit = peekFeed<T>(key);
  if (hit !== undefined) return hit;
  const pending = inFlight.get(key);
  if (pending) return pending as Promise<T>;
  const requestedGeneration = generation;
  const request = load().then(data => {
    if (requestedGeneration !== generation) return data;
    entries.delete(key);
    entries.set(key, { data, updatedAt: Date.now(), persist });
    while (entries.size > 48) entries.delete(entries.keys().next().value!);
    save();
    return data;
  }).finally(() => inFlight.delete(key));
  inFlight.set(key, request);
  return request;
}

export function invalidateFeeds(prefix: string): void {
  generation += 1;
  for (const key of entries.keys()) if (key.startsWith(prefix)) entries.delete(key);
  save();
}
