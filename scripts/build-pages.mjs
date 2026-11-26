#!/usr/bin/env node
/**
 * 构建 GitHub Pages 部署产物到 dist/：
 *   dist/demo/   apps/editor 的完整编辑器（相对 base，可挂在任意子路径）
 *   dist/docs/   中英双语文档站（base 由 DOCS_BASE 决定，默认 /litegraph/docs）
 *   dist/index.html  站点入口页（文档 / Demo / English）
 *   dist/.nojekyll   跳过 GitHub Pages 的 Jekyll 处理
 *
 * 用法：
 *   pnpm pages:build
 *   DOCS_BASE=/my/docs pnpm pages:build
 *
 * CI 在 master 上通过检查后会执行本脚本，并把 dist/ 发布到 gh-pages 分支；
 * shells/gh-pages.sh 是等价的本地手动发布入口。
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(repoRoot, "dist");
const docsBase = process.env.DOCS_BASE || "/litegraph/docs";

function run(command) {
  console.log(`\n$ ${command}`);
  execSync(command, { cwd: repoRoot, stdio: "inherit", env: { ...process.env, DOCS_BASE: docsBase } });
}

// 清理旧产物：VitePress 会清空 docs/，但编辑器产物目录在项目根之外，Vite 不会自动清空
for (const sub of ["docs", "demo"]) {
  rmSync(join(distDir, sub), { recursive: true, force: true });
}
mkdirSync(distDir, { recursive: true });

run("pnpm --filter @litegraph/editor build");
run("pnpm docs:build");

writeFileSync(join(distDir, ".nojekyll"), "");
writeFileSync(join(distDir, "index.html"), landingPage());

const expected = [
  join(distDir, "index.html"),
  join(distDir, "demo", "index.html"),
  join(distDir, "docs", "index.html"),
  join(distDir, "docs", "en", "index.html"),
];
const missing = expected.filter((file) => !existsSync(file));
if (missing.length) {
  console.error("✗ 部署产物缺失：");
  for (const file of missing) console.error(`  - ${file}`);
  process.exit(1);
}

console.log("\nPages 产物已生成：");
console.log(`  demo:  ${join(distDir, "demo")}`);
console.log(`  docs:  ${join(distDir, "docs")}（base: ${docsBase}）`);
console.log(`  root:  ${join(distDir, "index.html")}`);

function landingPage() {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LiteGraph — TypeScript 节点图引擎</title>
    <style>
      :root {
        color-scheme: light dark;
        --bg: #ffffff;
        --fg: #1f2328;
        --muted: #59636e;
        --card: #f6f8fa;
        --border: #d1d9e0;
        --accent: #3451b2;
      }
      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #1b1b1f;
          --fg: #dfdfd6;
          --muted: #98989f;
          --card: #202127;
          --border: #2e2e32;
          --accent: #a8b1ff;
        }
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 2rem;
        background: var(--bg);
        color: var(--fg);
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial,
          "Noto Sans SC", sans-serif;
        line-height: 1.6;
      }
      main { width: min(880px, 100%); }
      h1 { font-size: clamp(2.4rem, 8vw, 4rem); margin: 0; letter-spacing: -0.02em; }
      .tagline { color: var(--muted); margin: 0.5rem 0 2.5rem; font-size: 1.05rem; }
      .cards { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
      .card {
        display: block;
        padding: 1.25rem;
        border: 1px solid var(--border);
        border-radius: 12px;
        background: var(--card);
        color: inherit;
        text-decoration: none;
        transition: border-color 0.2s, transform 0.2s;
      }
      .card:hover { border-color: var(--accent); transform: translateY(-2px); }
      .card strong { display: block; font-size: 1.1rem; margin-bottom: 0.35rem; color: var(--accent); }
      .card span { color: var(--muted); font-size: 0.95rem; }
      .meta { margin-top: 2.5rem; color: var(--muted); font-size: 0.9rem; }
      .meta a { color: var(--accent); }
    </style>
  </head>
  <body>
    <main>
      <h1>LiteGraph</h1>
      <p class="tagline">TypeScript 节点图引擎 · A TypeScript node-graph engine</p>
      <nav class="cards">
        <a class="card" href="./docs/">
          <strong>文档</strong>
          <span>中文指南、95 个节点目录与 API 参考</span>
        </a>
        <a class="card" href="./docs/en/">
          <strong>Documentation</strong>
          <span>English guide, node catalog and API reference</span>
        </a>
        <a class="card" href="./demo/">
          <strong>在线 Demo</strong>
          <span>完整编辑器、内置 demo 与图 JSON 示例</span>
        </a>
      </nav>
      <p class="meta">MIT License · <a href="https://github.com/gausszhou/litegraph">GitHub</a></p>
    </main>
  </body>
</html>
`;
}
