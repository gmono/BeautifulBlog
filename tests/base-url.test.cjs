const test = require('node:test');
const assert = require('node:assert/strict');
const { stripBaseUrl } = require('../dist/app/url.js');

test('maps the base URL root to the static-site root', () => {
  assert.equal(stripBaseUrl('/BeautifulBlog', '/BeautifulBlog'), '/');
});

test('maps paths below the configured base URL', () => {
  assert.equal(stripBaseUrl('/BeautifulBlog/content/a.html', '/BeautifulBlog'), '/content/a.html');
});

test('does not accept a path that only shares the base URL prefix', () => {
  assert.equal(stripBaseUrl('/BeautifulBlog-evil/info', '/BeautifulBlog'), null);
});

test('treats root deployment consistently', () => {
  assert.equal(stripBaseUrl('/content/a.html', '/'), '/content/a.html');
});
