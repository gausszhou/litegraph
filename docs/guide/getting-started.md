# 快速开始

## 前置条件

- Node.js ≥ 18（CI 使用 20）
- pnpm 12（仓库在 `package.json` 的 `packageManager` 中固定了版本）

## 在仓库内运行

```bash
pnpm install

# 完整 Demo 编辑器（工具栏、示例下拉、小窗预览、live mode）
pnpm --filter @litegraph/editor dev

# 最小集成示例（一个 ConstantNumber → Watch）
pnpm --filter @litegraph/example-minimal dev

# 构建全部包与应用（按拓扑序）
pnpm build
```

文档站：

```bash
pnpm docs:dev     # 先重新生成节点目录与 API 文档，再启动 VitePress
pnpm docs:build   # 产物输出到 dist/docs
```

质量检查脚本（CI 会全部执行）：

| 命令 | 作用 |
| --- | --- |
| `pnpm lint` | ESLint 10 flat config + typescript-eslint |
| `pnpm typecheck` | 各包 `tsc --noEmit` |
| `pnpm nullcheck` | `strictNullChecks` 存量基线棘轮 |
| `pnpm test` | Vitest：核心、节点契约、交互、示例快照 |
| `pnpm test:coverage` | 核心路径覆盖率门槛（行/语句 ≥ 70%，分支 ≥ 60%，函数 ≥ 66%） |
| `pnpm size` | 各产物 raw / gzip 体积 |
| `pnpm verify-umd` | 在 VM 中加载 core 与各节点包 UMD，校验共享同一实例 |
| `pnpm verify-pack` | 逐个 `pnpm pack` 并校验 tarball 内容 |

## 接入自己的项目

> 0.1.x 阶段各包尚未发布到 npm，v1.0 才会正式发布。当前推荐两种方式：在同一个 pnpm workspace 里用 `workspace:*` 引用源码；或者先打包 tarball 再安装，以验证真实产物。

### 方式一：workspace 引用

```json
{
  "dependencies": {
    "@gausszhou/litegraph-core": "workspace:*",
    "@gausszhou/litegraph-nodes-basic": "workspace:*"
  }
}
```

开发期各包的 `main` / `types` 指向 `src`，因此可以直接断点调试源码。

### 方式二：安装打包产物

```bash
pnpm --filter @gausszhou/litegraph-core pack
pnpm --filter @gausszhou/litegraph-nodes-basic pack

# 在目标工程中
npm install ../litegraph/packages/core/gausszhou-litegraph-core-0.1.0.tgz \
            ../litegraph/packages/nodes-basic/gausszhou-litegraph-nodes-basic-0.1.0.tgz
```

`publishConfig` 会把入口切到 `dist/index.js` 与 `dist/index.d.ts`，CSS 则通过 `style.css` 子路径暴露。聚合包 `@gausszhou/litegraph` 依赖全部节点包，单独安装它的 tarball 需要同时安装所有节点包；在自己的工程里按需引入 core + 少量节点包通常更省体积。

### 一个最小的 Vite 工程

`index.html`：

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LiteGraph minimal</title>
  </head>
  <body>
    <canvas id="graph" style="width: 100vw; height: 100vh; display: block"></canvas>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

`src/main.ts`：

```ts
// 样式必须显式引入，core 入口不会隐式加载 CSS
import "@gausszhou/litegraph-core/style.css";

import { LGraph, LGraphCanvas, LiteGraph } from "@gausszhou/litegraph-core";
import installBasicNodes, { ConstantNumber, Watch } from "@gausszhou/litegraph-nodes-basic";

// 安装节点包（幂等：重复调用不会重复注册）
LiteGraph.use(installBasicNodes);

const canvas = document.querySelector<HTMLCanvasElement>("#graph")!;
const graph = new LGraph();
const graphCanvas = new LGraphCanvas(canvas, graph);

// 每帧执行后重绘画布
graph.onAfterExecute = () => graphCanvas.draw(true);

// 用类或类型字符串都可以创建节点
const source = LiteGraph.createNode(ConstantNumber);
source.pos = [200, 200];
source.setValue(4.5);

const sink = LiteGraph.createNode("basic/watch");
sink.pos = [600, 300];

graph.add(source);
graph.add(sink);
source.connect(0, sink, 0);

window.addEventListener("resize", () => graphCanvas.resize());

graph.start();
```

要点：

- **样式**：`@gausszhou/litegraph-core/style.css` 必须引入，否则节点、菜单与面板都没有样式。
- **尺寸**：canvas 由 CSS 决定大小；窗口尺寸变化后调用 `graphCanvas.resize()`。
- **画布与图**：`new LGraphCanvas(canvas, graph)` 会把两者绑定；多个画布不能绑定同一张图。
- **渲染循环**：`graph.start()` 负责执行；是否重绘由你决定，常见做法是在 `onAfterExecute` 中调用 `canvas.draw(true)`。

## 只跑图，不要编辑器

core 入口在 Node 环境中不会访问 `window`，所以可以只做图的加载、执行与序列化：

```ts
import { LGraph, LiteGraph } from "@gausszhou/litegraph-core";
import installBasicNodes from "@gausszhou/litegraph-nodes-basic";

LiteGraph.use(installBasicNodes);

const graph = new LGraph();
graph.configure(JSON.parse(fs.readFileSync("graph.json", "utf8")));

// 执行一帧
graph.runStep(1);

const watch = graph.getNodeById(2);
console.log(watch?.getOutputData(0));
```

如果节点逻辑依赖 DOM、Canvas 或 Web Audio，则需要自己提供对应环境；节点测试里用 jsdom 与 `FakeAudioContext` 做替身。

## 核心概念速查

| 操作 | API |
| --- | --- |
| 注册节点 | `LiteGraph.registerNodeType({ class, type, title, desc })` 或 `LiteGraph.registerNodeType("type/name", Class)` |
| 安装节点包 | `LiteGraph.use(install)`（推荐）/ 直接 `install(LiteGraph)` |
| 创建节点 | `LiteGraph.createNode("basic/number")` 或 `LiteGraph.createNode(ConstantNumber)` |
| 加入图 | `graph.add(node)` |
| 连接 | `source.connect(outputSlot, targetNode, inputSlot)` |
| 执行 | `graph.start()` / `graph.stop()` / `graph.runStep(n)` |
| 序列化 | `graph.serialize()` → JSON；`graph.configure(json)` 恢复 |
| 子图 | `LiteGraph.createNode("graph/subgraph")`，配合 `graph/input`、`graph/output` |

## 常见问题

**画布是空白的？**
检查是否引入 `style.css`、canvas 是否有非零尺寸、`graph.start()` 是否被调用。

**`window is not defined`？**
只 import core 与节点包，不要 import `apps/editor` 里的代码；core 入口本身不会访问 `window`。

**同时出现两份 LiteGraph 实例（节点注册了却创建不出来）？**
通常是把 core 重复打进了多个 chunk。用 UMD 时确保 core 以 `window.litegraph` 外置；用 ESM 时让构建工具把 `@gausszhou/litegraph-core` 解析到同一份依赖（monorepo 中用 `workspace:*`）。

**类型找不到？**
仓库内包的 `types` 指向 `src/index.ts`；安装 tarball 后指向 `dist/index.d.ts`。如果编辑器提示类型缺失，先确认安装的是打包产物而不是源码目录。

## 下一步

- [包与导入方式](/guide/packages)：聚合包、core、单节点包与 UMD 的取舍。
- [节点目录](/nodes/)：95 个节点的输入、输出、控件与属性。
- [示例应用](/guide/examples)：编辑器里的内置 demo 与 JSON 示例。
- [贡献指南](/guide/contributing)：新增节点、测试与文档生成。
