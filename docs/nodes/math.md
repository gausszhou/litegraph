<!-- 此文件由 scripts/gen-node-catalog.mjs 从源码生成，请勿手工编辑。 -->

# 节点目录：nodes-math

共 **5** 个节点。以下内容由 `scripts/gen-node-catalog.mjs` 从 [packages/nodes-math/src/install.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-math/src/install.ts) 提取。

槽位类型中的 `number`、`string`、`boolean` 等为普通数据端口，`event` 为事件端口；控件是绘制在节点上的交互组件，属性会随图一起序列化。

## `math/approx_eq` — Approx. Eq {#math-approx-eq}

Check if two floating-point numbers are approximately equal

- 输入：`A: number`、`B: number`、`epsilon: number`
- 输出：`true: boolean`、`false: boolean`
- 源码：[MathApproxEq.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-math/src/MathApproxEq.ts)

## `math/floor` — Floor {#math-floor}

Floor number to remove fractional part

- 输入：`in: number`
- 输出：`out: number`
- 源码：[MathFloor.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-math/src/MathFloor.ts)

## `math/noise` — Noise {#math-noise}

Random number with temporal continuity

- 输入：`in: number`
- 输出：`out: number`
- 属性：`min`、`max`、`smooth`、`seed`、`octaves`、`persistence`、`speed`
- 源码：[MathNoise.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-math/src/MathNoise.ts)

## `math/operation` — Operation {#math-operation}

Easy math operators

- 输入：`A: number,array,object`、`B: number`
- 输出：`=: number`
- 属性：`A`、`B`、`OP`
- 源码：[MathOperation.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-math/src/MathOperation.ts)

## `math/rand` — Rand {#math-rand}

Random number

- 输入：无
- 输出：`value: number`
- 属性：`min`、`max`
- 源码：[MathRand.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-math/src/MathRand.ts)
