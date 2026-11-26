#!/usr/bin/env node
/**
 * 节点脚手架：在指定节点包里生成一个节点类，并把它注册到 install.ts、导出到 index.ts。
 *
 * 用法：
 *   pnpm new-node <pack> <ClassName> [--type math/square] [--title "Square"] [--desc "说明"] [--dry-run]
 *
 * 示例：
 *   pnpm new-node math Square --title "Square" --desc "Squares its input"
 *
 * 生成后建议执行：
 *   pnpm typecheck
 *   pnpm test          # 节点契约测试会自动覆盖新注册的类型
 *   pnpm docs:nodes    # 更新中英文节点目录
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function listPacks() {
  return readdirSync(join(repoRoot, "packages"))
    .filter((name) => name.startsWith("nodes-"))
    .map((name) => name.slice("nodes-".length));
}

function kebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function splitWords(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
}

const argv = process.argv.slice(2);
const flags = {};
const positional = [];
for (let i = 0; i < argv.length; i += 1) {
  const arg = argv[i];
  if (arg === "--dry-run") {
    flags.dryRun = true;
  } else if (arg.startsWith("--")) {
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) fail(`参数 ${arg} 缺少值`);
    flags[arg.slice(2)] = value;
    i += 1;
  } else {
    positional.push(arg);
  }
}

const [pack, className] = positional;
if (!pack || !className) {
  fail("用法：pnpm new-node <pack> <ClassName> [--type type/name] [--title ...] [--desc ...] [--dry-run]");
}
if (!/^[A-Z][A-Za-z0-9]*$/.test(className)) {
  fail(`类名需为 PascalCase（例如 MathSquare），收到：${className}`);
}

const packDir = join(repoRoot, "packages", `nodes-${pack}`);
if (!existsSync(packDir)) {
  fail(`找不到节点包 packages/nodes-${pack}；可选：${listPacks().join(", ")}`);
}

const installFile = join(packDir, "src", "install.ts");
const indexFile = join(packDir, "src", "index.ts");
const nodeFile = join(packDir, "src", `${className}.ts`);
if (existsSync(nodeFile)) fail(`${nodeFile} 已存在`);
if (!existsSync(installFile)) fail(`缺少 ${installFile}`);

const type = flags.type ?? `${pack}/${kebab(className)}`;
const title = flags.title ?? splitWords(className);
const desc = flags.desc ?? "";
const installSource = readFileSync(installFile, "utf8");

if (installSource.includes(`"${type}"`)) fail(`节点类型 "${type}" 已在 install.ts 中注册`);
if (installSource.includes(`./${className}"`)) fail(`install.ts 已导入 ${className}`);

const paramMatch = installSource.match(/export const install\s*=\s*\(\s*([A-Za-z_$][\w$]*)\s*:/);
if (!paramMatch) fail(`无法解析 install.ts 的 install 函数参数，请手动注册 ${type}`);
const litegraphParam = paramMatch[1];

const indent = installSource.includes(`\n    ${litegraphParam}.registerNodeType(`) ? "    " : "  ";
const registration = [
  `${indent}${litegraphParam}.registerNodeType({`,
  `${indent}${indent}class: ${className},`,
  `${indent}${indent}title: ${JSON.stringify(title)},`,
  `${indent}${indent}desc: ${JSON.stringify(desc)},`,
  `${indent}${indent}type: ${JSON.stringify(type)},`,
  `${indent}});`,
].join("\n");

function patchInstall(source) {
  const lines = source.split("\n");
  let lastImport = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].startsWith("import ")) lastImport = i;
  }
  if (lastImport === -1) fail("install.ts 里没有 import 语句，请手动注册");
  lines.splice(lastImport + 1, 0, `import ${className} from "./${className}";`);

  const text = lines.join("\n");
  const closeIndex = text.lastIndexOf("\n};");
  if (closeIndex === -1) fail("install.ts 结尾不是 `};`，请手动注册");
  return `${text.slice(0, closeIndex)}\n${registration}${text.slice(closeIndex)}`;
}

const indexSource = existsSync(indexFile) ? readFileSync(indexFile, "utf8") : "";
let newIndexSource = indexSource;
if (!indexSource.includes(`"./${className}"`)) {
  const exportLine = `export { default as ${className} } from "./${className}";`;
  if (indexSource.includes("import { install }")) {
    newIndexSource = indexSource.replace("import { install }", `${exportLine}\nimport { install }`);
  } else {
    newIndexSource = `${exportLine}\n${indexSource}`;
  }
}

const newInstallSource = patchInstall(installSource);

const nodeSource = `import { type SlotLayout, type Vector2 } from "@gausszhou/litegraph-core";
import { LGraphNode } from "@gausszhou/litegraph-core";

export default class ${className} extends LGraphNode {
  static slotLayout: SlotLayout = {
    inputs: [{ name: "in", type: "number" }],
    outputs: [{ name: "out", type: "number" }],
  };

  override size: Vector2 = [140, 30];

  override onExecute() {
    const value = this.getInputData(0);
    if (value == null) {
      return;
    }
    this.setOutputData(0, value);
  }
}
`;

console.log(`节点类型：${type}`);
console.log(`标题：${title}`);
console.log(`节点文件：${nodeFile}`);
console.log(`注册文件：${installFile}`);
console.log(`导出文件：${indexFile}`);

if (flags.dryRun) {
  console.log(`\n--- ${className}.ts ---\n${nodeSource}`);
  console.log(`\n--- install.ts（新增）---\n${registration}`);
  console.log("\n（dry-run，未写入文件）");
  process.exit(0);
}

writeFileSync(nodeFile, nodeSource);
writeFileSync(installFile, newInstallSource);
if (newIndexSource !== indexSource) writeFileSync(indexFile, newIndexSource);

console.log("\n完成。下一步：");
console.log("  1. 编辑节点文件，补上真正的 onExecute / 控件 / 属性");
console.log("  2. pnpm typecheck && pnpm test");
console.log("  3. pnpm docs:nodes 更新节点目录");
