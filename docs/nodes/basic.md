<!-- 此文件由 scripts/gen-node-catalog.mjs 从源码生成，请勿手工编辑。 -->

# 节点目录：nodes-basic

共 **16** 个节点。以下内容由 `scripts/gen-node-catalog.mjs` 从 [packages/nodes-basic/src/install.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-basic/src/install.ts) 提取。

槽位类型中的 `number`、`string`、`boolean` 等为普通数据端口，`event` 为事件端口；控件是绘制在节点上的交互组件，属性会随图一起序列化。

## `basic/CompareValues` — GenericCompare {#basic-comparevalues}

Compare *

- 输入：`A: any`、`B: any`
- 输出：`true: boolean`、`false: boolean`
- 控件：`Op.: combo`
- 属性：`enabled`、`A`、`B`、`OP`
- 源码：[GenericCompare.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-basic/src/GenericCompare.ts)

## `basic/array[]` — Array[i] {#basic-array}

Returns an element from an array

- 输入：`array: array,table,string`、`index: number`
- 输出：`value: any`
- 属性：`index`
- 源码：[ArrayElement.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-basic/src/ArrayElement.ts)

## `basic/boolean` — Const Boolean {#basic-boolean}

Constant boolean

- 输入：无
- 输出：`bool: boolean`
- 控件：`value: toggle`
- 属性：`value`
- 源码：[ConstantBoolean.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-basic/src/ConstantBoolean.ts)

## `basic/const` — Const Number {#basic-const}

Constant number

- 输入：无
- 输出：`value: number`
- 控件：`value: number`
- 属性：`value`
- 源码：[ConstantNumber.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-basic/src/ConstantNumber.ts)

## `basic/file` — Const File {#basic-file}

Fetches a file from an url

- 输入：`url: string`
- 输出：`file: string`
- 控件：`url: text`
- 属性：`url`、`type`
- 源码：[ConstantFile.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-basic/src/ConstantFile.ts)

## `basic/integer` — Const Integer {#basic-integer}

Constant integer

- 输入：无
- 输出：`value: number`
- 控件：`value: number`
- 属性：`value`
- 源码：[ConstantInteger.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-basic/src/ConstantInteger.ts)

## `basic/is_null` — == Null {#basic-is-null}

Returns true if input is null

- 输入：`in: *`
- 输出：`is_null: boolean`
- 属性：`strictEquality`
- 源码：[IsNull.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-basic/src/IsNull.ts)

## `basic/json` — Const JSON {#basic-json}

Parses a string to JSON object

- 输入：无
- 输出：`data: object`
- 控件：`json: text`、`value: text`、`type: text`
- 属性：`json`、`value`、`type`
- 源码：[ConstantJSON.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-basic/src/ConstantJSON.ts)

## `basic/null` — Const Null {#basic-null}

Constant null or undefined

- 输入：无
- 输出：`null: *`
- 控件：`value: toggle`
- 属性：`value`
- 源码：[ConstantNull.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-basic/src/ConstantNull.ts)

## `basic/number` — Const Number {#basic-number}

Constant number

- 输入：无
- 输出：`value: number`
- 控件：`value: number`
- 属性：`value`
- 源码：[ConstantNumber.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-basic/src/ConstantNumber.ts)

## `basic/object` — Const Object {#basic-object}

Constant object

- 输入：无
- 输出：`obj: object`
- 属性：`value`
- 源码：[ConstantObject.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-basic/src/ConstantObject.ts)

## `basic/reroute` — Reroute {#basic-reroute}

Simple pass-through for organization

- 输入：`—: *`
- 输出：`—: *`
- 源码：[Reroute.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-basic/src/Reroute.ts)

## `basic/set_array` — Set Array {#basic-set-array}

Sets index of array

- 输入：`arr: array`、`value: any`
- 输出：`arr: array`
- 控件：`i: number`
- 属性：`index`
- 源码：[SetArray.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-basic/src/SetArray.ts)

## `basic/string` — Const String {#basic-string}

Constant string

- 输入：无
- 输出：`string: string`
- 控件：`value: text`
- 属性：`value`
- 源码：[ConstantString.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-basic/src/ConstantString.ts)

## `basic/time` — Time {#basic-time}

Current time

- 输入：无
- 输出：`in ms: number`、`in sec: number`
- 属性：`enabled`
- 源码：[Time.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-basic/src/Time.ts)

## `basic/watch` — Watch {#basic-watch}

Show value of input

- 输入：`value: any`
- 输出：无
- 属性：`value`
- 源码：[Watch.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-basic/src/Watch.ts)
