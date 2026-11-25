// 汇总各包构建产物的体积（原始 / gzip），用于发布说明与 README 数据。
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { gzipSync } from "node:zlib";

const root = process.cwd();
const packagesDir = join(root, "packages");
const rows = [];

for (const dir of readdirSync(packagesDir).sort()) {
  const pkgPath = join(packagesDir, dir, "package.json");
  const distDir = join(packagesDir, dir, "dist");
  if (!existsSync(pkgPath) || !existsSync(distDir)) continue;

  const { name } = JSON.parse(readFileSync(pkgPath, "utf8"));
  for (const file of readdirSync(distDir).sort()) {
    if (!/\.(js|cjs|mjs)$/.test(file)) continue;
    const path = join(distDir, file);
    if (!statSync(path).isFile()) continue;
    const raw = readFileSync(path);
    rows.push({
      pkg: name,
      file: relative(root, path),
      raw: raw.length,
      gzip: gzipSync(raw).length,
    });
  }
}

if (rows.length === 0) {
  console.error("no dist output found, run `pnpm build` first");
  process.exit(1);
}

const kb = (n) => (n / 1024).toFixed(2).padStart(9);
console.log(`${"package".padEnd(38)} ${"file".padEnd(44)} ${"raw".padStart(9)} ${"gzip".padStart(9)}`);
for (const r of rows) {
  console.log(`${r.pkg.padEnd(38)} ${r.file.padEnd(44)} ${kb(r.raw)} ${kb(r.gzip)}`);
}
const total = rows.reduce((acc, r) => ({ raw: acc.raw + r.raw, gzip: acc.gzip + r.gzip }), { raw: 0, gzip: 0 });
console.log(`\n${rows.length} bundles, total ${(total.raw / 1024).toFixed(2)} kB (gzip ${(total.gzip / 1024).toFixed(2)} kB)`);
