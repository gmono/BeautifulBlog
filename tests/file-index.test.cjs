const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { pruneFileIndex } = require('../dist/app/file-index.js');
const generate = require('../dist/app/generator.js').default;

test('removes deleted articles from the published file index', () => {
  const files = {
    useConfig: 'default',
    fileList: {
      '/content/kept.json': { title: 'kept', article_path: 'articles/kept.md', filesDir_url: '' },
      '/content/deleted.json': { title: 'deleted', article_path: 'articles/deleted.md', filesDir_url: '' },
    },
  };

  const result = pruneFileIndex(files, new Set(['articles/kept.md']));

  assert.deepEqual(Object.keys(result.fileList), ['/content/kept.json']);
});

test('generation removes stale outputs and their index entries', async () => {
  const originalCwd = process.cwd();
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'beautifulblog-generation-'));
  try {
    await fs.mkdir(path.join(workspace, 'articles'), { recursive: true });
    await fs.mkdir(path.join(workspace, 'config'), { recursive: true });
    await fs.mkdir(path.join(workspace, 'content'), { recursive: true });
    await fs.writeFile(path.join(workspace, 'global.json'), JSON.stringify({ editor: '', configName: 'default' }));
    await fs.writeFile(path.join(workspace, 'config/default.json'), JSON.stringify({
      base_url: '/', code_languages: ['js'], site: 'default', editor: '',
    }));
    await fs.writeFile(path.join(workspace, 'articles/kept.md'), '---\ntitle: Kept\ndate: 2024-01-01\n---\nKept article');
    const kept = { title: 'Kept', article_path: './articles/kept.md', filesDir_url: '' };
    const stale = { title: 'Stale', article_path: './articles/stale.md', filesDir_url: '' };
    await fs.writeFile(path.join(workspace, 'content/files.json'), JSON.stringify({
      useConfig: 'default',
      fileList: { '/content/kept.json': kept, '/content/stale.json': stale },
    }));
    await fs.writeFile(path.join(workspace, 'content/stale.html'), 'stale');
    await fs.writeFile(path.join(workspace, 'content/stale.json'), JSON.stringify({ title: 'Stale' }));

    process.chdir(workspace);
    await generate('default');

    const index = JSON.parse(await fs.readFile(path.join(workspace, 'content/files.json'), 'utf8'));
    assert.deepEqual(Object.keys(index.fileList), ['/content/kept.json']);
    await assert.rejects(fs.access(path.join(workspace, 'content/stale.html')));
    await assert.rejects(fs.access(path.join(workspace, 'content/stale.json')));
    assert.equal(await fs.readFile(path.join(workspace, 'content/kept.html'), 'utf8').then(s => s.includes('Kept article')), true);
  } finally {
    process.chdir(originalCwd);
    await fs.rm(workspace, { recursive: true, force: true });
  }
});
