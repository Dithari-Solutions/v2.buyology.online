import { test, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { cachedFeed, invalidateFeeds, peekFeed } from './feed-cache';
import { feedExpiresAt } from './feed-policy';
import { cachedProducts, fetchProducts } from './catalogue';

const originalNow = Date.now;
const NOW = Date.parse('2026-10-07T12:00:00Z');
let now = NOW;
const storage = new Map<string, string>();
Object.defineProperty(globalThis, 'window', { value: { location: { hostname: 'buyology.online' } }, configurable: true });
Object.defineProperty(globalThis, 'sessionStorage', { value: {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
}, configurable: true });
beforeEach(() => { now = NOW; Date.now = () => now; invalidateFeeds(''); storage.clear(); });
after(() => { Date.now = originalNow; Reflect.deleteProperty(globalThis, 'window'); Reflect.deleteProperty(globalThis, 'sessionStorage'); });

test('deduplicates concurrent reads and avoids repeat loads while fresh', async () => {
  let resolve!: (value: string[]) => void;
  let loads = 0;
  const load = () => { loads++; return new Promise<string[]>(r => { resolve = r; }); };
  const first = cachedFeed('public', load), second = cachedFeed('public', load);
  resolve(['story']);
  assert.deepEqual(await first, await second);
  assert.deepEqual(await cachedFeed('public', load), ['story']);
  assert.equal(loads, 1);
});
test('refreshes stale data and never reuses a price after sale expiry', async () => {
  let loads = 0;
  const load = async () => ({ price: ++loads === 1 ? 80 : 100, flashSaleEndsAt: loads === 1 ? new Date(NOW + 5000).toISOString() : null });
  await cachedFeed('sale', load);
  now += 6000;
  assert.equal(peekFeed('sale', true), undefined);
  assert.equal((await cachedFeed('sale', load)).price, 100);
});
test('private likes stay out of session storage and accounts have separate keys', async () => {
  await cachedFeed('stories:en:guest', async () => [{ likedByMe: false }]);
  await cachedFeed('stories:en:account-a', async () => [{ likedByMe: true }], false);
  assert.equal(peekFeed('stories:en:account-b'), undefined);
  const stored = storage.get('buyo_public_feeds_v1')!;
  assert.ok(stored.includes('guest'));
  assert.ok(!stored.includes('account-a'));
});
test('a failed network request does not poison the cache', async () => {
  await assert.rejects(cachedFeed('failed', async () => { throw new Error('offline'); }));
  assert.equal(await cachedFeed('failed', async () => 'recovered'), 'recovered');
});
test('bounds snapshots by signed media expiry, including links already expired at arrival', () => {
  const data = { thumbnailUrl: 'https://media.example/story?X-Amz-Date=20261007T120000Z&X-Amz-Expires=60' };
  assert.equal(feedExpiresAt(data, NOW, 300_000), NOW + 30_000);
  assert.ok(feedExpiresAt(data, NOW + 40_000) < NOW + 40_000);
});
test('invalidation prevents an old in-flight request repopulating a changed feed', async () => {
  let resolve!: (value: string) => void;
  const pending = cachedFeed('stories:en:guest', () => new Promise<string>(r => { resolve = r; }));
  invalidateFeeds('stories:');
  resolve('old'); await pending;
  assert.equal(peekFeed('stories:en:guest'), undefined);
});


test('starts category and product requests together, restores a first page, and rejects expired sale snapshots', async () => {
  const originalFetch = globalThis.fetch;
  const calls: string[] = [];
  let finishCategory!: () => void;
  let finishProduct!: () => void;
  const rows = [{ id: 'p', title: 'Product', categoryId: 'c', storePrice: 80, originalPrice: 100,
    currency: 'AED', media: [], flashSaleEndsAt: new Date(NOW + 5000).toISOString() }];
  globalThis.fetch = (async (url: string) => {
    const path = new URL(url, 'https://buyology.online').pathname;
    calls.push(path);
    if (path === '/api/category') await new Promise<void>(resolve => { finishCategory = resolve; });
    else await new Promise<void>(resolve => { finishProduct = resolve; });
    return new Response(JSON.stringify({ data: path === '/api/category' ? [{ id: 'c', name: 'Computers' }] : rows }), { status: 200 });
  }) as typeof fetch;
  try {
    const first = fetchProducts('en');
    assert.deepEqual(calls.sort(), ['/api/category', '/api/product']);
    finishCategory(); finishProduct();
    const response = await first;
    assert.equal(response.items[0].category, 'Computers');
    assert.equal(cachedProducts('en')?.items[0].price, 80);
    await fetchProducts('en');
    assert.equal(calls.length, 2);
    now += 6000;
    assert.equal(cachedProducts('en'), undefined);
  } finally { globalThis.fetch = originalFetch; }
});
