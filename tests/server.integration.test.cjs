const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const net = require('node:net');

const projectRoot = path.resolve(__dirname, '..');

test('server serves a prefixed site, info and rejects lookalike prefixes', async () => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'beautifulblog-server-'));
  const probe = net.createServer();
  await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve));
  const occupiedPort = probe.address().port;
  let port;
  let output = '';
  let child;
  try {
    await fs.mkdir(path.join(workspace, 'articles'), { recursive: true });
    await fs.mkdir(path.join(workspace, 'config'), { recursive: true });
    await fs.writeFile(path.join(workspace, 'global.json'), JSON.stringify({ editor: '', configName: 'default' }));
    await fs.writeFile(path.join(workspace, 'config/default.json'), JSON.stringify({
      base_url: '/BeautifulBlog', code_languages: ['js'], site: 'default', editor: '',
    }));
    await fs.writeFile(path.join(workspace, 'articles/hello.md'), '---\ntitle: Hello\ndate: 2024-01-01\n---\nHello article');
    await fs.writeFile(path.join(workspace, 'index.html'), '<!doctype html><title>BB integration</title>');
    child = spawn(process.execPath, [path.join(projectRoot, 'dist/app/blog.js'), 'sync', String(occupiedPort)], {
      cwd: workspace,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.stdout.on('data', chunk => { output += chunk; });
    child.stderr.on('data', chunk => { output += chunk; });

    for (let attempt = 0; attempt < 100; attempt++) {
      const match = output.match(/服务器启动，端口:(\d+)/);
      if (match) { port = Number(match[1]); break; }
      if (child.exitCode !== null) throw new Error(`server exited early: ${output}`);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    assert.ok(port, `server did not report a listening port: ${output}`);
    assert.notEqual(port, occupiedPort, 'server must select another port when requested port is occupied');
    await new Promise(resolve => probe.close(resolve));
    let response;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (child.exitCode !== null) throw new Error(`server exited early: ${output}`);
      try {
        response = await fetch(`http://127.0.0.1:${port}/BeautifulBlog/`);
        break;
      } catch {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    assert.ok(response, `server did not become ready: ${output}`);
    const page = await response.text();
    assert.equal(response.status, 200, `${page}\n${output}`);
    assert.match(page, /BB integration/);
    assert.equal((await fetch(`http://127.0.0.1:${port}/BeautifulBlog-evil/info`)).status, 404);
    const infoUrl = `http://127.0.0.1:${port}/info`;
    const firstInfo = await fetch(infoUrl);
    assert.equal(firstInfo.status, 200);
    const firstUpdate = (await firstInfo.json()).article_updateTime;
    let catalog;
    for (let attempt = 0; attempt < 100; attempt++) {
      try {
        catalog = JSON.parse(await fs.readFile(path.join(workspace, 'content/files.json'), 'utf8'));
        if (Object.keys(catalog.fileList).length) break;
      } catch {}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(catalog && Object.keys(catalog.fileList).length, `generation did not index article: ${output}`);
    const metaPath = Object.keys(catalog.fileList)[0];
    const articleUrl = `http://127.0.0.1:${port}${metaPath.replace(/\.json$/, '.html')}`;
    const initialArticle = await fetch(articleUrl);
    const initialBody = await initialArticle.text();
    assert.match(initialBody, /Hello article/, `${initialArticle.status} ${articleUrl} ${JSON.stringify(catalog)}\n${output}`);

    for (let attempt = 0; attempt < 100 && !output.includes('文章监视已就绪'); attempt++) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    assert.match(output, /文章监视已就绪/);

    await fs.writeFile(path.join(workspace, 'articles/hello.md'), '---\ntitle: Hello\ndate: 2024-01-01\n---\nUpdated article');
    let updated = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      const article = await (await fetch(articleUrl)).text();
      const info = await (await fetch(infoUrl)).json();
      if (article.includes('Updated article') && info.article_updateTime !== firstUpdate) {
        updated = true;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.equal(updated, true, `article watcher did not publish changes: ${output}`);
  } finally {
    if (probe.listening) await new Promise(resolve => probe.close(resolve));
    if (child && child.exitCode === null) {
      child.kill('SIGTERM');
      await new Promise(resolve => child.once('exit', resolve));
    }
    await fs.rm(workspace, { recursive: true, force: true });
  }
});
