// 校验发布产物：对每个可发布包执行 pnpm pack，检查发布后的入口、类型与 CSS 是否都在 tarball 中。
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = process.cwd();
const packagesDir = join(root, "packages");
const outDir = mkdtempSync(join(tmpdir(), "litegraph-pack-"));
const errors = [];
const rows = [];

function collectExports(value, acc = []) {
  if (typeof value === "string") {
    acc.push(value);
  } else if (value && typeof value === "object") {
    for (const v of Object.values(value)) collectExports(v, acc);
  }
  return acc;
}

for (const dir of readdirSync(packagesDir).sort()) {
  const pkgPath = join(packagesDir, dir, "package.json");
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(pkgPath, "utf8"));
  } catch {
    continue;
  }
  const publish = manifest.publishConfig;
  if (!publish) continue;
  if (!manifest.files?.includes("dist")) {
    errors.push(`${manifest.name}: files 未包含 dist`);
  }

  const before = new Set(readdirSync(outDir));
  execFileSync("pnpm", ["--filter", manifest.name, "pack", "--pack-destination", outDir], {
    cwd: root,
    stdio: "pipe",
  });
  const created = readdirSync(outDir).filter((f) => f.endsWith(".tgz") && !before.has(f));
  if (created.length !== 1) {
    errors.push(`${manifest.name}: 未生成 tarball`);
    continue;
  }
  const tarball = join(outDir, created[0]);
  const listing = execFileSync("tar", ["-tzf", tarball], { encoding: "utf8" });
  const packed = JSON.parse(
    execFileSync("tar", ["-xOzf", tarball, "package/package.json"], { encoding: "utf8" }),
  );

  const problems = [];
  if (packed.main !== publish.main) problems.push(`main=${packed.main}`);
  if (packed.types !== publish.types) problems.push(`types=${packed.types}`);
  const expected = collectExports(publish.exports).filter((p) => p.startsWith("./dist/"));
  for (const rel of expected) {
    if (!listing.includes(`package/${rel.slice(2)}`)) problems.push(`missing ${rel}`);
  }
  if (listing.includes("package/src/")) problems.push("tarball 泄漏了 src/");
  if (!listing.includes("package/dist/index.d.ts")) problems.push("missing dist/index.d.ts");

  rows.push({ name: manifest.name, ok: problems.length === 0, problems });
  if (problems.length) errors.push(`${manifest.name}: ${problems.join(", ")}`);
}

for (const r of rows) {
  console.log(`${r.ok ? "ok  " : "FAIL"} ${r.name}${r.ok ? "" : ` -> ${r.problems.join(", ")}`}`);
}
console.log(`\n${rows.length} packages packed into ${outDir}`);

if (errors.length) {
  console.error(`\n${errors.length} package(s) failed verification`);
  process.exit(1);
}
