<!-- 此文件由 scripts/gen-node-catalog.mjs 从源码生成，请勿手工编辑。 -->

# 节点目录：核心内建

共 **3** 个节点。以下内容由 `scripts/gen-node-catalog.mjs` 从 [packages/core/src/nodes/](https://github.com/gausszhou/litegraph/blob/master/packages/core/src/nodes/) 提取。

槽位类型中的 `number`、`string`、`boolean` 等为普通数据端口，`event` 为事件端口；控件是绘制在节点上的交互组件，属性会随图一起序列化。

## `graph/input` — Input {#graph-input}

Input of the graph

- 输入：无
- 输出：`—: number`
- 控件：`Name: text`、`Type: combo`、`Type: text`、`Value: number`
- 属性：`name`、`type`、`value`、`subgraphID`
- 源码：[GraphInput.ts](https://github.com/gausszhou/litegraph/blob/master/packages/core/src/nodes/GraphInput.ts)

## `graph/output` — Output {#graph-output}

Output of the graph

- 输入：`—: any`
- 输出：无
- 控件：`Name: text`、`Type: combo`、`Type: text`
- 属性：`name`、`type`、`subgraphID`
- 源码：[GraphOutput.ts](https://github.com/gausszhou/litegraph/blob/master/packages/core/src/nodes/GraphOutput.ts)

## `graph/subgraph` — Subgraph {#graph-subgraph}

Graph inside a node

- 输入：无
- 输出：无
- 属性：`enabled`
- 源码：[Subgraph.ts](https://github.com/gausszhou/litegraph/blob/master/packages/core/src/nodes/Subgraph.ts)
