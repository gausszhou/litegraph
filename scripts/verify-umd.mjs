// 校验 UMD 产物：在模拟浏览器全局（无 module/exports/define）的 VM 中加载 core 与各节点包 UMD，
// 确认它们通过 window.litegraph 命名空间共享同一个引擎实例，并能正常注册节点。
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const root = process.cwd();
const packagesDir = join(root, "packages");

const sandbox = { console, window: {} };
vm.createContext(sandbox);
const context = vm.createContext(sandbox);
const run = (file) => vm.runInContext(readFileSync(file, "utf8"), context, { filename: file });

const failures = [];

run(join(packagesDir, "core/dist/index.umd.cjs"));
const core = sandbox.litegraph;
if (!core?.LiteGraph) {
  failures.push("core UMD 未提供 window.litegraph.LiteGraph");
}
const LiteGraph = core?.LiteGraph;
let registered = LiteGraph ? Object.keys(LiteGraph.registered_node_types).length : 0;
console.log(`core UMD: litegraph namespace exposes ${Object.keys(core ?? {}).length} exports`);

const packs = [];
for (const dir of readdirSync(packagesDir).sort()) {
  if (!dir.startsWith("nodes-")) continue;
  const pkgDir = join(packagesDir, dir);
  const umd = join(pkgDir, "dist/index.umd.cjs");
  let stat;
  try {
    stat = statSync(umd);
  } catch {
    failures.push(`${dir}: 缺少 dist/index.umd.cjs`);
    continue;
  }
  if (!stat.isFile()) continue;

  // 全局名由 vite lib.name 决定：litegraph + Nodes + PascalCase(包名后缀)
  const suffix = dir.slice("nodes-".length);
  const globalName =
    "litegraphNodes" +
    suffix
      .split("-")
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join("");

  run(umd);
  const pack = sandbox[globalName];
  const install = pack?.default;
  if (!pack) {
    failures.push(`${dir}: UMD 未挂载到 window.${globalName}`);
    continue;
  }
  if (typeof install !== "function") {
    failures.push(`${dir}: UMD 未导出 default install 函数`);
    continue;
  }
  install(LiteGraph);
  const now = Object.keys(LiteGraph.registered_node_types).length;
  packs.push({ dir, globalName, added: now - registered });
  if (now <= registered) failures.push(`${dir}: install() 后没有新增节点类型`);
  registered = now;
}

for (const p of packs) {
  console.log(`ok   ${p.dir} -> window.${p.globalName} (+${p.added} node types)`);
}
console.log(`\n${packs.length} UMD packs loaded, ${registered} node types registered in one LiteGraph instance`);

if (failures.length) {
  console.error(`\n${failures.length} failure(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
