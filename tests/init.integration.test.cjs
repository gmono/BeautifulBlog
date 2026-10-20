const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const projectRoot = path.resolve(__dirname, '..');

test('blog init creates a usable blog with the bundled about article', async () => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'beautifulblog-init-'));
  const blogPath = path.join(workspace, 'new-blog');
  const gitConfig = path.join(workspace, 'gitconfig');
  await fs.writeFile(gitConfig, '[user]\n\tname = Blog Test\n\temail = blog-test@example.invalid\n');
  let output = '';
  try {
    const child = spawn(process.execPath, [path.join(projectRoot, 'dist/app/blog.js'), 'init', blogPath], {
      cwd: workspace,
      env: { ...process.env, GIT_CONFIG_GLOBAL: gitConfig },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.stdout.on('data', chunk => { output += chunk; });
    child.stderr.on('data', chunk => { output += chunk; });
    const exitCode = await new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('exit', resolve);
    });
    assert.equal(exitCode, 0, output);
    const article = await fs.readFile(path.join(blogPath, 'articles/about.md'), 'utf8');
    assert.match(article, /title: About/);
    assert.ok(await fs.stat(path.join(blogPath, 'sites/default/index.html')));
    assert.ok(await fs.stat(path.join(blogPath, 'config/default.json')));
    assert.ok(await fs.stat(path.join(blogPath, '.git')));
  } finally {
    await fs.rm(workspace, { recursive: true, force: true });
  }
});
