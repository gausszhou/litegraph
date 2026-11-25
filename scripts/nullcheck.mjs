// strictNullChecks 迁移看板：以基线为闸门，防止新增 null 安全问题，同时允许逐步清理存量。
// 用法：node scripts/nullcheck.mjs [--update] [packages/core ...]
import { createRequire } from "node:module";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(root, "packages/core/package.json"));
const ts = require("typescript");

const args = process.argv.slice(2);
const update = args.includes("--update");
const targets = args.filter((a) => !a.startsWith("--"));
const packageDirs = targets.length ? targets : ["packages/core"];
const baselinePath = join(root, "nullcheck-baseline.json");
const baseline = existsSync(baselinePath)
  ? JSON.parse(readFileSync(baselinePath, "utf8"))
  : { packages: {} };

function collect(packageDir) {
  const configPath = join(root, packageDir, "tsconfig.json");
  const cfg = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(cfg.config, ts.sys, join(root, packageDir));
  const options = { ...parsed.options, strictNullChecks: true, noEmit: true };
  const program = ts.createProgram(parsed.fileNames, options);
  const byFile = {};
  const messages = [];
  for (const d of ts.getPreEmitDiagnostics(program)) {
    if (!d.file || d.start === undefined) continue;
    const file = relative(join(root, packageDir), d.file.fileName).split("\\").join("/");
    byFile[file] = (byFile[file] ?? 0) + 1;
    const { line, character } = d.file.getLineAndCharacterOfPosition(d.start);
    messages.push({
      file,
      line: line + 1,
      character: character + 1,
      code: d.code,
      message: ts.flattenDiagnosticMessageText(d.messageText, " ").split("\n")[0],
    });
  }
  return { byFile, messages, total: messages.length };
}

let failed = false;
const nextBaseline = { packages: { ...baseline.packages } };

for (const packageDir of packageDirs) {
  const result = collect(packageDir);
  const expected = baseline.packages[packageDir];

  if (!update && !expected) {
    console.error(`${packageDir}: 缺少基线，请先运行 node scripts/nullcheck.mjs --update ${packageDir}`);
    failed = true;
    continue;
  }

  const baselineFiles = expected?.files ?? {};
  const regressed = Object.entries(result.byFile).filter(
    ([file, count]) => count > (baselineFiles[file] ?? 0),
  );

  if (!update && regressed.length) {
    console.error(`${packageDir}: strictNullChecks 出现新增问题`);
    for (const [file, count] of regressed) {
      console.error(`  ${file}: ${count}（基线 ${baselineFiles[file] ?? 0}）`);
      for (const m of result.messages.filter((x) => x.file === file).slice(0, 5)) {
        console.error(`    ${file}:${m.line}:${m.character} TS${m.code} ${m.message}`);
      }
    }
    failed = true;
    continue;
  }

  const improved = Object.entries(baselineFiles)
    .filter(([file, count]) => count > (result.byFile[file] ?? 0))
    .map(([file, count]) => `${file} ${count} -> ${result.byFile[file] ?? 0}`);
  console.log(
    `${packageDir}: ${result.total} 处（基线 ${expected?.total ?? result.total}）` +
      (improved.length ? `\n  可更新基线：${improved.join(", ")}` : ""),
  );

  nextBaseline.packages[packageDir] = {
    total: update ? result.total : (expected?.total ?? result.total),
    files: update ? result.byFile : { ...baselineFiles },
  };
}

if (update) {
  writeFileSync(baselinePath, JSON.stringify(nextBaseline, null, 2) + "\n");
  console.log(`基线已更新：nullcheck-baseline.json`);
}

if (failed) process.exit(1);
