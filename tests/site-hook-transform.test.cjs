const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const generate = require('../dist/app/generator.js').default;

test('a site hook can claim an extension and replace the default transformer', async () => {
  const originalCwd = process.cwd();
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'beautifulblog-site-hook-'));
  try {
    await fs.mkdir(path.join(workspace, 'articles'), { recursive: true });
    await fs.mkdir(path.join(workspace, 'config'), { recursive: true });
    await fs.mkdir(path.join(workspace, 'sites/custom'), { recursive: true });
    await fs.writeFile(path.join(workspace, 'global.json'), JSON.stringify({ editor: '', configName: 'default' }));
    await fs.writeFile(path.join(workspace, 'config/default.json'), JSON.stringify({
      base_url: '/', code_languages: [], site: 'custom', editor: '',
    }));
    await fs.writeFile(path.join(workspace, 'articles/example.foo'), 'raw source from the author');
    await fs.writeFile(path.join(workspace, 'sites/custom/hooks.js'), `
      module.exports = {
        metainfo: { articleExtensions: ['.foo'] },
        interceptArticle(context) {
          if (context.sourcePath.endsWith('example.foo') && context.destinationPath.endsWith('example')) {
            return {
              html: '<article>handled by site</article>',
              meta: { title: 'Site handled', date: new Date('2024-01-01T00:00:00.000Z') },
            };
          }
        },
      };
    `);
    process.chdir(workspace);
    await generate('default', false, true);
    assert.match(await fs.readFile(path.join(workspace, 'content/example.html'), 'utf8'), /handled by site/);
    const meta = JSON.parse(await fs.readFile(path.join(workspace, 'content/example.json'), 'utf8'));
    assert.equal(meta.title, 'Site handled');
    const index = JSON.parse(await fs.readFile(path.join(workspace, 'content/files.json'), 'utf8'));
    assert.equal(index.fileList['/content/example.json'].title, 'Site handled');
  } finally {
    process.chdir(originalCwd);
    await fs.rm(workspace, { recursive: true, force: true });
  }
});

test('refresh keeps previous output when the new theme cannot process an existing format', async () => {
  const originalCwd = process.cwd();
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'beautifulblog-theme-switch-'));
  try {
    await fs.mkdir(path.join(workspace, 'articles'), { recursive: true });
    await fs.mkdir(path.join(workspace, 'config'), { recursive: true });
    await fs.mkdir(path.join(workspace, 'sites/new-theme'), { recursive: true });
    await fs.mkdir(path.join(workspace, 'content/example.dir'), { recursive: true });
    await fs.writeFile(path.join(workspace, 'global.json'), JSON.stringify({ editor: '', configName: 'default' }));
    await fs.writeFile(path.join(workspace, 'config/default.json'), JSON.stringify({
      base_url: '/', code_languages: [], site: 'new-theme', editor: '',
    }));
    await fs.writeFile(path.join(workspace, 'articles/example.foo'), 'source');
    await fs.writeFile(path.join(workspace, 'sites/new-theme/hooks.js'), 'module.exports = { metainfo: { articleExtensions: [] } };');
    await fs.writeFile(path.join(workspace, 'content/example.html'), '<article>previous result</article>');
    await fs.writeFile(path.join(workspace, 'content/example.json'), JSON.stringify({ title: 'Previous', article_path: './articles/example.foo' }));
    await fs.writeFile(path.join(workspace, 'content/example.dir/asset.txt'), 'previous attachment');
    await fs.writeFile(path.join(workspace, 'content/files.json'), JSON.stringify({
      useConfig: 'default',
      fileList: { '/content/example.json': { title: 'Previous', article_path: './articles/example.foo', filesDir_url: '/content/example.dir' } },
    }));
    process.chdir(workspace);
    await generate('default', false, true);
    assert.equal(await fs.readFile(path.join(workspace, 'content/example.html'), 'utf8'), '<article>previous result</article>');
    assert.equal(await fs.readFile(path.join(workspace, 'content/example.dir/asset.txt'), 'utf8'), 'previous attachment');
    const index = JSON.parse(await fs.readFile(path.join(workspace, 'content/files.json'), 'utf8'));
    assert.ok(index.fileList['/content/example.json']);
  } finally {
    process.chdir(originalCwd);
    await fs.rm(workspace, { recursive: true, force: true });
  }
});

test('interceptor failure keeps the previous article output and index', async () => {
  const originalCwd = process.cwd();
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'beautifulblog-hook-failure-'));
  try {
    await fs.mkdir(path.join(workspace, 'articles'), { recursive: true });
    await fs.mkdir(path.join(workspace, 'config'), { recursive: true });
    await fs.mkdir(path.join(workspace, 'sites/failing-theme'), { recursive: true });
    await fs.writeFile(path.join(workspace, 'global.json'), JSON.stringify({ editor: '', configName: 'default' }));
    await fs.writeFile(path.join(workspace, 'config/default.json'), JSON.stringify({
      base_url: '/', code_languages: [], site: 'failing-theme', editor: '',
    }));
    await fs.writeFile(path.join(workspace, 'articles/example.foo'), 'source');
    await fs.writeFile(path.join(workspace, 'sites/failing-theme/hooks.js'), `
      module.exports = {
        metainfo: { articleExtensions: ['.foo'] },
        interceptArticle() { throw new Error('intentional hook failure'); },
      };
    `);
    await fs.writeFile(path.join(workspace, 'content-placeholder'), '');
    await fs.mkdir(path.join(workspace, 'content'), { recursive: true });
    await fs.writeFile(path.join(workspace, 'content/example.html'), '<article>previous result</article>');
    await fs.writeFile(path.join(workspace, 'content/example.json'), JSON.stringify({ title: 'Previous' }));
    await fs.writeFile(path.join(workspace, 'content/files.json'), JSON.stringify({
      useConfig: 'default',
      fileList: { '/content/example.json': { title: 'Previous', article_path: './articles/example.foo', filesDir_url: '/content/example.dir' } },
    }));
    process.chdir(workspace);
    await assert.rejects(() => generate('default', false, true), /intentional hook failure/);
    assert.equal(await fs.readFile(path.join(workspace, 'content/example.html'), 'utf8'), '<article>previous result</article>');
    assert.equal(JSON.parse(await fs.readFile(path.join(workspace, 'content/example.json'), 'utf8')).title, 'Previous');
    const index = JSON.parse(await fs.readFile(path.join(workspace, 'content/files.json'), 'utf8'));
    assert.equal(index.fileList['/content/example.json'].title, 'Previous');
  } finally {
    process.chdir(originalCwd);
    await fs.rm(workspace, { recursive: true, force: true });
  }
});
