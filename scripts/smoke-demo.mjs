#!/usr/bin/env node
/**
 * Demo 冒烟测试：用无头 Chrome 打开构建后的 apps/editor，依次切换每个示例，断言
 *   1. 画布不是空白（与 Empty 状态做像素对比）；
 *   2. 图里确实有节点与连线；
 *   3. 页面没有 JS 异常 / console.error。
 *
 * 用法：
 *   pnpm --filter @litegraph/editor build
 *   pnpm demo:smoke
 *
 * Chrome 查找顺序：$CHROME_PATH → 系统 google-chrome / chromium → macOS / Windows 默认路径。
 * 只依赖 playwright-core（不下载浏览器），CI 使用 GitHub runner 自带的 Chrome。
 */
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { chromium } from "playwright-core";

const repoRoot = resolve(import.meta.dirname, "..");
const demoRoot = join(repoRoot, "dist", "demo");

const args = process.argv.slice(2);
const screenshotsIndex = args.findIndex((arg) => arg === "--screenshots" || arg.startsWith("--screenshots="));
let screenshotsDir = null;
if (screenshotsIndex !== -1) {
  const value = args[screenshotsIndex].includes("=")
    ? args[screenshotsIndex].split("=")[1]
    : args[screenshotsIndex + 1] && !args[screenshotsIndex + 1].startsWith("--")
      ? args[screenshotsIndex + 1]
      : "artifacts/demo-smoke";
  screenshotsDir = resolve(repoRoot, value);
  mkdirSync(screenshotsDir, { recursive: true });
}
const indexFile = join(demoRoot, "index.html");

if (!existsSync(indexFile)) {
  console.error("✗ 找不到 dist/demo/index.html，请先运行 pnpm --filter @litegraph/editor build");
  process.exit(1);
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".webm": "video/webm",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
};

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ].filter(Boolean);
  return candidates.find((candidate) => existsSync(candidate));
}

function startServer() {
  const server = createServer((req, res) => {
    try {
      const url = new URL(req.url ?? "/", "http://localhost");
      let filePath = normalize(join(demoRoot, decodeURIComponent(url.pathname)));
      if (!filePath.startsWith(demoRoot + sep) && filePath !== demoRoot) {
        res.writeHead(403).end("forbidden");
        return;
      }
      if (url.pathname.endsWith("/")) {
        filePath = join(filePath, "index.html");
      }
      if (!existsSync(filePath) || !statSync(filePath).isFile()) {
        res.writeHead(404).end("not found");
        return;
      }
      res.writeHead(200, { "content-type": MIME[extname(filePath)] ?? "application/octet-stream" });
      res.end(readFileSync(filePath));
    } catch (error) {
      res.writeHead(500).end(String(error));
    }
  });
  return new Promise((resolvePromise) => {
    server.listen(0, "127.0.0.1", () => {
      resolvePromise({ server, port: server.address().port });
    });
  });
}

/** 采样画布像素（每 8px 一个点），用于和 Empty 状态做差异比较。 */
async function sampleCanvas(page) {
  return page.evaluate(() => {
    const editor = window.__editor;
    const canvas = editor.graphCanvas.canvas;
    const context = canvas.getContext("2d");
    const step = 8;
    const { width, height } = canvas;
    const data = context.getImageData(0, 0, width, height).data;
    const pixels = [];
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const i = (y * width + x) * 4;
        pixels.push(data[i], data[i + 1], data[i + 2]);
      }
    }
    return { width, height, pixels };
  });
}

function diffRatio(a, b) {
  if (a.width !== b.width || a.height !== b.height) {
    return 1;
  }
  let changed = 0;
  const total = a.pixels.length / 3;
  for (let i = 0; i < a.pixels.length; i += 3) {
    const delta = Math.max(
      Math.abs(a.pixels[i] - b.pixels[i]),
      Math.abs(a.pixels[i + 1] - b.pixels[i + 1]),
      Math.abs(a.pixels[i + 2] - b.pixels[i + 2]),
    );
    if (delta > 10) {
      changed += 1;
    }
  }
  return changed / total;
}

async function main() {
  const chromePath = findChrome();
  if (!chromePath) {
    console.error("✗ 找不到 Chrome / Chromium，请设置 CHROME_PATH 环境变量");
    process.exit(1);
  }

  const { server, port } = await startServer();
  const baseUrl = `http://127.0.0.1:${port}/`;
  console.log(`Chrome: ${chromePath}`);
  console.log(`Serving: ${demoRoot} -> ${baseUrl}`);

  const browser = await chromium.launch({
    executablePath: chromePath,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  const failures = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const pageErrors = [];
    page.on("response", (response) => {
      if (response.status() >= 400) {
        pageErrors.push(`http ${response.status()}: ${response.url()}`);
      }
    });
    page.on("pageerror", (error) => pageErrors.push(`pageerror: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") {
        pageErrors.push(`console.error: ${message.text()}`);
      }
    });

    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.waitForFunction(() => Boolean(window.__editor));
    await page.waitForTimeout(300);

    const select = "#LGEditorTopBarSelector select";
    const options = await page.$$eval(`${select} option`, (nodes) =>
      nodes.map((node) => node.value).filter(Boolean),
    );
    console.log(`示例：${options.join(", ")}\n`);

    await page.selectOption(select, "Empty");
    await page.waitForTimeout(300);
    const baseline = await sampleCanvas(page);

    for (const name of options) {
      if (name === "Empty" || name.startsWith("上次")) {
        continue;
      }
      await page.selectOption(select, name);
      await page.waitForTimeout(450);

      const info = await page.evaluate(() => {
        const editor = window.__editor;
        return {
          nodes: editor.graph._nodes.length,
          links: Object.keys(editor.graph.links ?? {}).length,
          canvas: [editor.graphCanvas.canvas.width, editor.graphCanvas.canvas.height],
        };
      });
      const sample = await sampleCanvas(page);
      const ratio = diffRatio(baseline, sample);

      // Fit 之后所有节点都应落在画布内（允许 4px 误差），防止布局/视图回归
      const offscreen = await page.evaluate(() => {
        const editor = window.__editor;
        const canvas = editor.graphCanvas.canvas;
        const ds = editor.graphCanvas.ds;
        const width = canvas.clientWidth || canvas.width;
        const height = canvas.clientHeight || canvas.height;
        return editor.graph._nodes
          .map((node) => {
            const [x, y] = ds.convertOffsetToCanvas([node.pos[0], node.pos[1]]);
            return {
              type: node.type,
              left: x,
              top: y,
              right: x + node.size[0] * ds.scale,
              bottom: y + node.size[1] * ds.scale,
            };
          })
          .filter(
            (rect) =>
              rect.left < -4 ||
              rect.top < -4 ||
              rect.right > width + 4 ||
              rect.bottom > height + 4,
          )
          .map((rect) => rect.type);
      });

      if (screenshotsDir) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        await page.locator("#main canvas.graphCanvas").screenshot({
          path: join(screenshotsDir, `${slug}.png`),
        });
      }

      const ok = info.nodes > 0 && info.links > 0 && ratio > 0.002 && offscreen.length === 0;
      console.log(
        `${ok ? "ok  " : "FAIL"} ${name.padEnd(18)} nodes=${String(info.nodes).padStart(2)} links=${String(
          info.links,
        ).padStart(2)} diff=${(ratio * 100).toFixed(2)}%`,
      );
      if (!ok) {
        failures.push(
          `${name}: nodes=${info.nodes} links=${info.links} diff=${(ratio * 100).toFixed(2)}% offscreen=${
            offscreen.join(",") || "-"
          }`,
        );
      }
    }

    if (pageErrors.length) {
      failures.push(...pageErrors);
    }
  } finally {
    await browser.close();
    server.close();
  }

  if (failures.length) {
    console.error(`\n✗ ${failures.length} 个问题：`);
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }
  console.log("\n✓ 全部示例渲染正常");
  if (screenshotsDir) {
    console.log(`截图已保存到 ${screenshotsDir}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
