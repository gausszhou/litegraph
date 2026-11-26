# LiteGraph 是什么

LiteGraph 是一个用 TypeScript 编写的**节点图引擎**：节点、插槽与连线绘制在 HTML5 Canvas 上，整张图可以被编辑、执行与序列化。它既是可视化编辑器（拖拽节点、连线、改属性），也是一个纯数据流运行时（在浏览器或 Node 中直接跑图，不需要画布）。

本仓库是 [jagenjo/litegraph.js](https://github.com/jagenjo/litegraph.js) 的 TypeScript 重写版本（并参考了 [space-nuko/litegraph.ts](https://github.com/space-nuko/litegraph.ts)），拆成了 pnpm monorepo：**核心引擎 + 可插拔节点包 + 示例应用 + 文档站**。与上游相比，这里的节点包是独立的 npm 包，可以按需安装；类型检查开启了 `strict`；构建产物同时提供 ESM、UMD 与 `.d.ts`。

## 它能做什么

- **可视化脚本**：把业务逻辑拆成节点图，让非程序员在浏览器里连线和调参。
- **数据/信号流编辑**：音频处理链、MIDI 生成、数学运算、字符串处理等内置节点可以直接组合。
- **实时界面**：`live_mode` 隐藏编辑器的网格、边框与插槽，只保留节点自绘内容，适合做仪表盘或控制面板。
- **图即配置**：`graph.serialize()` 得到纯 JSON，可以存数据库、随应用分发，或作为插件格式。
- **嵌入任意 Web 应用**：只需要一个 `<canvas>` 和一个容器元素；核心包不隐式依赖样式，样式通过 `style.css` 子路径显式引入。

## 架构

```text
LiteGraph（全局注册表 + 配置）
├── LGraph            一张图：节点、连线、分组、输入输出、执行循环、序列化
│   ├── LGraphNode    节点基类：插槽、widget、属性、序列化、onExecute 等回调
│   ├── LLink         连线
│   └── LGraphGroup   画布上的分组框
├── LGraphCanvas      画布：事件、渲染、UI（三个 mixin 拼装成一个类）
│   ├── DragAndScale  视口缩放与平移
│   └── ContextMenu   右键菜单
└── 内建节点           GraphInput、GraphOutput、Subgraph
```

几个关键设计：

- **注册表模式**：节点类型在运行时注册到 `LiteGraph.registered_node_types`。`LiteGraph.use(install)` 负责安装一个节点包并去重，`LiteGraph.registerNodeType()` 负责单个注册、补全 `category` 与默认标题。因此节点包之间互不 import，只依赖 core。
- **类 + interface 声明合并 + `applyMixins`**：`LGraphCanvas` 把事件、渲染、UI 三个文件里的原型方法混入自身，避免 42 个手写包装方法；类型层面仍然是一个完整的类。
- **数据流 + 事件流**：普通插槽通过 `getInputData()` / `setOutputData()` 传递值；类型为 `event`（`BuiltInSlotType.EVENT`）的插槽传递动作，触发 `onAction`。
- **执行顺序**：`LGraph.computeExecutionOrder()` 按连线依赖做拓扑排序；`graph.start()` 每帧对可执行节点依次调用 `onExecute`，`graph.stop()` 结束循环。
- **两套画布**：`LGraphCanvas` 内部维护背景层与交互层两个 canvas，`draw()` 时先绘制背景再绘制前景，避免每帧重绘静态内容。

## 包矩阵

| 包 | 说明 | 节点数 |
| --- | --- | --- |
| `@gausszhou/litegraph-core` | 引擎核心：注册表、图、节点、画布、连线、分组、子图、内建 graph 节点 | 3 |
| `@gausszhou/litegraph` | 聚合包：安装全部节点包，并重新导出 core 的全部 API 与样式 | — |
| `@gausszhou/litegraph-nodes-basic` | 常量、watch、reroute、时间、比较、数组取值 | 16 |
| `@gausszhou/litegraph-nodes-math` | 数学运算、取整、随机、近似相等 | 5 |
| `@gausszhou/litegraph-nodes-logic` | 与/或/非、比较、分支、选择器 | 8 |
| `@gausszhou/litegraph-nodes-strings` | 字符串拼接、JSON 解析/序列化、比较、替换 | 12 |
| `@gausszhou/litegraph-nodes-events` | 定时器、延迟、过滤、日志、分支 | 10 |
| `@gausszhou/litegraph-nodes-input` | 手柄输入 | 1 |
| `@gausszhou/litegraph-nodes-widget` | 按钮、开关、滑块、旋钮、进度条、面板等控件节点 | 10 |
| `@gausszhou/litegraph-nodes-graphics` | 曲线绘图 | 1 |
| `@gausszhou/litegraph-nodes-audio` | 振荡器、滤波器、延迟、混响、示波器等 Web Audio 节点 | 17 |
| `@gausszhou/litegraph-nodes-midi` | MIDI 输入/输出、生成、量化、移调 | 12 |

核心 3 个内建节点是 `graph/input`、`graph/output` 与 `graph/subgraph`；10 个节点包合计 92 个节点，总共 **95 个节点类型**。完整清单见[节点目录](/nodes/)。

## 仓库结构

```text
packages/
  core/            引擎核心（不依赖任何节点包）
  litegraph/       聚合包（core + 全部节点包）
  nodes-basic/     ┐
  nodes-math/      │
  nodes-logic/     │
  nodes-strings/   ├ 10 个节点包，每个只依赖 core
  nodes-events/    │
  nodes-input/     │
  nodes-widget/    │
  nodes-graphics/  │
  nodes-audio/     │
  nodes-midi/      ┘
  tests/           跨包测试：核心路径、节点契约、交互、示例快照
apps/
  editor/          完整 Demo 编辑器（工具栏、示例下拉、小窗、live mode）
  example-minimal/ 最小集成示例
docs/              VitePress 文档站
scripts/           构建/校验/文档生成脚本
```

## 适用边界

LiteGraph 只负责「图」本身：节点管理、连线、执行调度、画布交互与序列化。以下内容需要你自己提供或由节点实现：

- 节点的业务逻辑（`onExecute`、`onDrawForeground`、`onAction` 等回调）；
- 具体渲染后端（核心只有 Canvas2D；`enableWebGL()` 目前是空实现，见[路线图](/guide/contributing#路线图)）；
- 持久化与权限（序列化结果是 JSON，存哪里、谁能改由应用决定）；
- 无头运行时的 DOM 依赖：core 入口不会隐式访问 `window`，但 `LGraphCanvas` 仍然需要 DOM。

## 下一步

- [快速开始](/guide/getting-started)：5 分钟跑起编辑器或最小示例。
- [包与导入方式](/guide/packages)：按需引入 core、单个节点包或聚合包。
- [节点目录](/nodes/)：95 个节点类型的输入、输出、控件与属性。
- [API 参考](/api/)：由源码生成的公开 API 文档。
