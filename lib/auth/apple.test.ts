import assert from 'node:assert/strict';
import { test } from 'node:test';

process.env.NEXT_PUBLIC_APPLE_CLIENT_ID = 'com.buyology.web';
process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI = 'https://buyology.online';

test('Apple popup binds the server nonce and checks state before signing in', async () => {
  const originalFetch = globalThis.fetch;
  let options: Record<string, unknown> = {};
  const calls: Array<{ path: string; body: Record<string, unknown> }> = [];
  const fakeWindow = {
    AppleID: { auth: {
      init: (value: Record<string, unknown>) => { options = value; },
      signIn: async () => ({ authorization: { code: 'apple-code', state: options.state },
        user: { name: { firstName: 'Customer' } } }),
    } },
  };
  Object.defineProperty(globalThis, 'window', { value: fakeWindow, configurable: true });
  globalThis.fetch = async (input, init) => {
    const path = String(input);
    calls.push({ path, body: JSON.parse(String(init?.body)) });
    const data = path.endsWith('/challenge') ? { nonce: 'a'.repeat(43) } : {
      accessToken: `header.${Buffer.from(JSON.stringify({ sub: 'credential', uid: 'customer' })).toString('base64url')}.signature`, expiresIn: 900,
    };
    return Response.json({ statusCode: 200, data });
  };
  try {
    const { signInWithApple } = await import('./apple');
    const result = await signInWithApple();
    assert.equal(result.uid, 'customer');
    assert.equal(options.clientId, 'com.buyology.web');
    assert.equal(options.nonce, 'a'.repeat(43));
    assert.equal(options.redirectURI, 'https://buyology.online');
    assert.equal(calls[0].body.platform, 'web');
    assert.equal(calls[1].body.nonce, options.nonce);
    assert.equal(calls[1].body.firstName, 'Customer');
    assert.equal(calls[1].body.code, 'apple-code');
    fakeWindow.AppleID.auth.signIn = async () => ({ authorization: { code: 'attacker-code', state: 'wrong-state' }, user: { name: { firstName: 'Customer' } } });
    await assert.rejects(signInWithApple(), /Invalid Apple login state/);
    assert.equal(calls.filter(call => call.path.endsWith('/callback')).length, 1);
  } finally {
    globalThis.fetch = originalFetch;
    Reflect.deleteProperty(globalThis, 'window');
  }
});
