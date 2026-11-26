# LiteGraph

> A Node Graph Engine

LiteGraph 是一个运行在浏览器中的节点图引擎：在 Canvas2D 上渲染节点、插槽与连线，既能作为可视化编辑器使用，也能在无编辑器的状态下直接执行图逻辑，思路类似虚幻蓝图、Pure Data。本仓库基于 [jagenjo/litegraph.js](https://github.com/jagenjo/litegraph.js) 与 [space-nuko/litegraph.ts](https://github.com/space-nuko/litegraph.ts) 重构，使用 TypeScript 重写，并拆分为「核心引擎 + 可插拔节点包 + 示例应用 + 文档站」的 pnpm monorepo。

- 在线 Demo：https://gausszhou.github.io/litegraph/demo
- 文档：[简体中文](https://gausszhou.github.io/litegraph/docs/) / [English](https://gausszhou.github.io/litegraph/docs/en/)
- 路线图：[ROADMAP.md](ROADMAP.md)

## 特性

- **Canvas2D 渲染**：双层画布（背景层 + 交互层），支持缩放、平移、分组、多选、对齐吸附、自定义连线样式。
- **可视化编辑**：搜索框、右键菜单、节点属性面板、widget（slider / combo / toggle / knob / panel 等）、复制粘贴、子图。
- **图可执行、可序列化**：`graph.start()` 按依赖顺序执行；整图可序列化为 JSON 再恢复；`live_mode` 下隐藏编辑 UI、只保留节点自绘，适合做实时界面。
- **子图**：`Subgraph` 本身就是一个节点，配合 `GraphInput` / `GraphOutput` 组合复用。
- **可插拔节点**：节点包导出 `install(LiteGraph)`，通过 `LiteGraph.use(plugin)` 幂等注册，可按需引入。
- **内置节点**：约 95 个节点类型，分布在 10 个节点包（basic / math / logic / strings / events / input / widget / audio / midi / graphics）与 core（GraphInput / GraphOutput / Subgraph）中。
- **TypeScript + Vite**：所有包产出 ESM + UMD；UMD 构建把 core 外置到 `window.litegraph` 命名空间，多个节点包共享同一份引擎实例；类型声明随构建生成。
- **样式独立**：`import "@gausszhou/litegraph-core/style.css"` 显式引入，core 入口不再隐式依赖 CSS；类型收紧仍在进行中（见[路线图](ROADMAP.md) v0.2）。

## 仓库结构

| 路径 | 说明 |
| --- | --- |
| `packages/core` | 引擎核心：`LGraph`、`LGraphNode`、`LGraphCanvas`（渲染/UI/事件拆分为三个类）、`LLink`、`LGraphGroup`、`DragAndScale`、`ContextMenu`，以及 `GraphInput` / `GraphOutput` / `Subgraph` |
| `packages/litegraph` | 聚合包：依次 `LiteGraph.use()` 全部节点包，导出 core 的全部 API |
| `packages/nodes-*` | 10 个节点包，各自 `export default install`，只依赖 core |
| `packages/tests` | Vitest 测试（`LGraphTests`、`SubgraphTests`） |
| `apps/editor` | 完整 Demo 编辑器：工具栏、示例下拉、小窗预览、live mode、电路演示节点 |
| `apps/example-minimal` | 最小集成示例：`LGraph` + `LGraphCanvas` + 两个节点 |
| `docs` | VitePress 双语文档站：`guide/`（中文）与 `en/guide/`（英文），节点目录与 API 文档由脚本生成 |
| `shells` | 构建脚本 `build.sh`、手动发布脚本 `gh-pages.sh`（自动发布见 CI 的 `deploy` job） |
| `scripts` | 体积报告、UMD 冒烟、tarball 校验、节点目录生成 `gen-node-catalog.mjs`、节点脚手架 `new-node.mjs` |
| `eslint.config.mjs` | ESLint 10 flat config（typescript-eslint） |
| `.github/workflows` | CI：typecheck → test → build → 体积报告 → tarball 校验 |

## 快速开始

```bash
pnpm install

# 运行编辑器 Demo
pnpm --filter @litegraph/editor dev

# 运行最小示例
pnpm --filter @litegraph/example-minimal dev

# 全量构建（按拓扑序：packages/* → apps/*）
pnpm build

# 质量检查
pnpm lint           # ESLint（flat config + typescript-eslint）
pnpm typecheck      # 各包 tsc --noEmit
pnpm nullcheck      # strictNullChecks 存量基线校验（防止新增）
pnpm test           # vitest（243 个用例，含示例快照）
pnpm size           # 各产物体积（raw / gzip）
pnpm verify-umd     # 在 VM 中加载 core 与各节点包 UMD，校验共享实例与注册
pnpm verify-pack    # 逐个 pnpm pack 并校验 tarball 内容

# 文档（中文 + English）
pnpm docs:dev       # 生成节点目录与 API 文档后启动 VitePress
pnpm docs:build     # 构建到 dist/docs
pnpm docs:nodes     # 只重新生成中英文节点目录
pnpm docs:api       # 只重新生成 Typedoc API 文档

# 新增节点脚手架
pnpm new-node math Square --title "Square" --desc "Squares its input"
```

最小用法（完整版见 `apps/example-minimal`）：

```ts
import { LGraph, LGraphCanvas, LiteGraph } from "@gausszhou/litegraph";
import { ConstantNumber, Watch } from "@gausszhou/litegraph-nodes-basic";

const graph = new LGraph();
const canvas = new LGraphCanvas(document.querySelector<HTMLCanvasElement>(".graphCanvas")!, graph);

graph.onAfterExecute = () => canvas.draw(true);

const source = LiteGraph.createNode(ConstantNumber);
source.pos = [200, 200];
source.setValue(4.5);

const sink = LiteGraph.createNode(Watch);
sink.pos = [600, 300];

graph.add(source);
graph.add(sink);
source.connect(0, sink, 0);
graph.start();
```

> 说明：仓库内 `main` / `types` 指向 `src`，方便 workspace 直接调试源码；`pnpm pack` / `pnpm publish` 时由 `publishConfig` 切换到 `dist/index.js` 与 `dist/index.d.ts`。CSS 需单独引入：`import "@gausszhou/litegraph-core/style.css"`（聚合包为 `@gausszhou/litegraph/style.css`）。

## 部署

`master` 上的 push 在 CI（lint / typecheck / test / build / docs:build 等）全部通过后，`deploy` job 会执行 `pnpm pages:build` 生成 `dist/`，并强制推送到 `gh-pages` 分支；GitHub Pages 从该分支发布：

- 文档（中文）：https://gausszhou.github.io/litegraph/docs/
- 文档（English）：https://gausszhou.github.io/litegraph/docs/en/
- 在线 Demo：https://gausszhou.github.io/litegraph/demo/
- 站点入口：https://gausszhou.github.io/litegraph/

`pnpm pages:build` 会构建编辑器 demo 与中英双语文档站，并写入站点入口页与 `.nojekyll`。文档 base 默认 `/litegraph/docs`，可用环境变量 `DOCS_BASE` 覆盖。应急/离线手动发布：`sh shells/gh-pages.sh`。

## 路线图

发布计划、各阶段交付物与验收标准见 [ROADMAP.md](ROADMAP.md)。

## 致谢

```text
https://github.com/jagenjo/litegraph.js
https://github.com/space-nuko/litegraph.ts
```

## License

MIT，见 [LICENSE](LICENSE)。
