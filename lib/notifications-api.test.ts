import { test } from 'node:test';
import assert from 'node:assert/strict';
import { notificationRoute } from './notifications-api';

test('admin cart outreach opens the customer cart from the website notification inbox', () => {
  assert.equal(notificationRoute('CART_MESSAGE'), '/cart');
  assert.equal(notificationRoute('CART_REMINDER'), '/cart');
  assert.equal(notificationRoute('PAYMENT_HELP'), '/account#orders');
  assert.equal(notificationRoute('UNKNOWN'), null);
});
