# 包与导入方式

仓库里的每个目录都是一个独立的 npm 包（`packages/tests` 除外，它只用于测试）。理解包的分层，可以避免「为什么节点创建不出来」「为什么打包出两份引擎」这类问题。

## 包一览

| 包名 | 目录 | 依赖 core | 内容 |
| --- | --- | --- | --- |
| `@gausszhou/litegraph-core` | `packages/core` | — | 引擎核心：`LiteGraph`、`LGraph`、`LGraphNode`、`LGraphCanvas`、`LLink`、`LGraphGroup`、`Subgraph`、`GraphInput`、`GraphOutput` |
| `@gausszhou/litegraph` | `packages/litegraph` | 是 | 聚合包：安装全部节点包并重新导出 core 的全部 API |
| `@gausszhou/litegraph-nodes-basic` | `packages/nodes-basic` | 是 | 常量、watch、reroute、时间、比较、数组取值 |
| `@gausszhou/litegraph-nodes-math` | `packages/nodes-math` | 是 | 数学运算、取整、随机、近似相等 |
| `@gausszhou/litegraph-nodes-logic` | `packages/nodes-logic` | 是 | 与/或/非、比较、分支、选择器 |
| `@gausszhou/litegraph-nodes-strings` | `packages/nodes-strings` | 是 | 字符串拼接、JSON、比较、替换 |
| `@gausszhou/litegraph-nodes-events` | `packages/nodes-events` | 是 | 定时器、延迟、过滤、日志、分支 |
| `@gausszhou/litegraph-nodes-input` | `packages/nodes-input` | 是 | 手柄输入 |
| `@gausszhou/litegraph-nodes-widget` | `packages/nodes-widget` | 是 | 按钮、开关、滑块、旋钮、进度条、面板 |
| `@gausszhou/litegraph-nodes-graphics` | `packages/nodes-graphics` | 是 | 曲线绘图 |
| `@gausszhou/litegraph-nodes-audio` | `packages/nodes-audio` | 是 | Web Audio 节点 |
| `@gausszhou/litegraph-nodes-midi` | `packages/nodes-midi` | 是 | MIDI 输入/输出与处理 |

节点包之间**互不依赖**，只依赖 core；因此可以只装需要的那几个。

## 三种引入策略

### 1. 聚合包：最少代码

```ts
import "@gausszhou/litegraph/style.css";
import { LGraph, LGraphCanvas, LiteGraph } from "@gausszhou/litegraph";

// 聚合包在 import 时已自动安装全部 10 个节点包
const graph = new LGraph();
const canvas = new LGraphCanvas("#graph", graph);
```

适合 Demo、原型、编辑器类应用。代价是会把所有节点包打进产物。

### 2. core + 按需节点包：体积最小

```ts
import "@gausszhou/litegraph-core/style.css";
import { LGraph, LGraphCanvas, LiteGraph } from "@gausszhou/litegraph-core";
import installBasicNodes from "@gausszhou/litegraph-nodes-basic";
import installMathNodes from "@gausszhou/litegraph-nodes-math";

LiteGraph.use(installBasicNodes);
LiteGraph.use(installMathNodes);
```

节点包默认导出 `install(LiteGraph)`；也可以直接 `install(LiteGraph)`，但 `LiteGraph.use()` 会记录已安装的插件，重复调用不会重复注册。

除默认导出外，节点包还导出各自的节点类，便于按类创建：

```ts
import { ConstantNumber, Watch } from "@gausszhou/litegraph-nodes-basic";

const node = LiteGraph.createNode(ConstantNumber);
const watch = LiteGraph.createNode(Watch);
```

### 3. UMD：无构建工具的 `<script>`

构建后，core 暴露为 `window.litegraph`，节点包暴露为 `window.litegraphNodes<PascalCase>`（如 `litegraphNodesBasic`、`litegraphNodesAudio`），默认导出挂在 `.default` 上：

```html
<link rel="stylesheet" href="litegraph.css" />
<script src="index.umd.cjs"></script>
<script src="nodes-basic/index.umd.cjs"></script>
<script>
  const { LiteGraph } = window.litegraph;
  const installBasic = window.litegraphNodesBasic.default;
  installBasic(LiteGraph);

  const graph = new window.litegraph.LGraph();
  new window.litegraph.LGraphCanvas("#graph", graph);
</script>
```

UMD 构建把 core 外置成全局命名空间，所以多个节点包会共享**同一个** `LiteGraph` 实例；`pnpm verify-umd` 会在 VM 中逐一加载并验证这一点。

## 入口与产物

各包的 `main` / `types` / `exports` 在源码态指向 `src`，方便 workspace 内调试；发布时由 `publishConfig` 覆盖为 `dist`：

| 包 | 源码入口 | 发布入口 | 样式子路径 |
| --- | --- | --- | --- |
| core | `src/index.ts` | `dist/index.js` + `dist/index.d.ts` | `./style.css` → `dist/litegraph.css` |
| 聚合包 | `src/index.ts` | `dist/index.js` + `dist/index.d.ts` | `./style.css` → `dist/style.css` |
| 节点包 | `src/index.ts` | `dist/index.js` + `dist/index.d.ts` | 无 |

构建同时产出 ESM（`index.js`）与 UMD（`index.umd.cjs`）；节点包的 UMD 把 `@gausszhou/litegraph-core` 标记为 external 并映射到全局 `litegraph`，因此不会把 core 再打包一份。类型声明由 `tsc --emitDeclarationOnly` 生成。

## 版本与发布

- 所有包当前版本为 `0.1.0`，相互之间用 `workspace:*` 引用；`pnpm pack` / `pnpm publish` 时再解析为具体版本。
- v1.0 之前不发布到 npm；发布计划（changesets、语义化版本、迁移指南）见[路线图](https://github.com/gausszhou/litegraph/blob/master/ROADMAP.md)。
- `pnpm verify-pack` 会对每个包执行 `pnpm pack` 并校验 tarball 里包含 `dist`、`package.json` 与类型声明，避免把源码或测试打进包里。

## 选择建议

| 场景 | 建议 |
| --- | --- |
| 只想快速看效果 / 做 Demo | 聚合包 `@gausszhou/litegraph` |
| 生产应用，只用少量节点 | `core` + 需要的 2~3 个节点包 |
| 已有构建链，想避免重复打包 core | `core` + 节点包，并确保 core 只被解析一次 |
| 纯静态页面、无打包器 | core 与节点包的 UMD |
| 只做图的后端执行 | 只装 `core`（+ 节点包），不 import 画布 |
