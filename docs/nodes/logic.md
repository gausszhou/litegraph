<!-- 此文件由 scripts/gen-node-catalog.mjs 从源码生成，请勿手工编辑。 -->

# 节点目录：nodes-logic

共 **8** 个节点。以下内容由 `scripts/gen-node-catalog.mjs` 从 [packages/nodes-logic/src/install.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-logic/src/install.ts) 提取。

槽位类型中的 `number`、`string`、`boolean` 等为普通数据端口，`event` 为事件端口；控件是绘制在节点上的交互组件，属性会随图一起序列化。

## `logic/and` — AND {#logic-and}

Return true if all inputs are true

- 输入：`a: boolean`、`b: boolean`
- 输出：`out: boolean`
- 源码：[LogicAnd.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-logic/src/LogicAnd.ts)

## `logic/branch` — Branch {#logic-branch}

Branch execution on condition

- 输入：`onTrigger: action`、`condition: boolean`
- 输出：`true: event`、`false: event`
- 源码：[LogicBranch.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-logic/src/LogicBranch.ts)

## `logic/compare` — Compare {#logic-compare}

Compare for logical equality

- 输入：`a: boolean`、`b: boolean`
- 输出：`out: boolean`
- 源码：[LogicCompare.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-logic/src/LogicCompare.ts)

## `logic/not` — NOT {#logic-not}

Return the logical negation

- 输入：`in: boolean`
- 输出：`out: boolean`
- 源码：[LogicNot.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-logic/src/LogicNot.ts)

## `logic/or` — OR {#logic-or}

Return true if at least one input is true

- 输入：`a: boolean`、`b: boolean`
- 输出：`out: boolean`
- 源码：[LogicOr.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-logic/src/LogicOr.ts)

## `logic/selector` — Selector {#logic-selector}

selects an output

- 输入：`sel: number`、`A: any`、`B: any`、`C: any`、`D: any`
- 输出：`out: any`
- 源码：[Selector.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-logic/src/Selector.ts)

## `logic/sequence` — Sequence {#logic-sequence}

select one element from a sequence from a string

- 输入：`index: number`、`seq: *`
- 输出：`out: *`
- 源码：[Sequence.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-logic/src/Sequence.ts)

## `logic/truthy` — ~= TRUE {#logic-truthy}

Returns true if input is truthy

- 输入：`in: *`
- 输出：`truthy: boolean`
- 源码：[LogicTruthy.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-logic/src/LogicTruthy.ts)
