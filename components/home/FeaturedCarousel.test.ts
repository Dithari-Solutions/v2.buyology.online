import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FeaturedCarousel } from './FeaturedCarousel';

test('initial HTML loads only the leading hero while retaining every slide and control', () => {
  const banners = Array.from({ length: 4 }, (_, index) => ({ id: String(index),
    backgroundImageUrl: `/banner-${index}.png`, text: `Campaign ${index}`, sortOrder: index }));
  const html = renderToStaticMarkup(createElement(FeaturedCarousel, { banners, label: 'Departments' }));
  assert.equal((html.match(/<img\b/g) ?? []).length, 1);
  assert.ok(html.includes('banner-0.png'));
  assert.ok(html.includes('q=75'));
  for (let index = 0; index < 4; index++) assert.ok(html.includes(`Campaign ${index}`));
});
