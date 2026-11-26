<!-- 此文件由 scripts/gen-node-catalog.mjs 从源码生成，请勿手工编辑。 -->

# 节点目录：nodes-strings

共 **12** 个节点。以下内容由 `scripts/gen-node-catalog.mjs` 从 [packages/nodes-strings/src/install.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-strings/src/install.ts) 提取。

槽位类型中的 `number`、`string`、`boolean` 等为普通数据端口，`event` 为事件端口；控件是绘制在节点上的交互组件，属性会随图一起序列化。

## `string/compare` — Compare {#string-compare}

Compares strings

- 输入：`A: string`、`B: string`
- 输出：`==: boolean`
- 源码：[StringCompare.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-strings/src/StringCompare.ts)

## `string/concatenate` — Concatenate {#string-concatenate}

Concatenates strings

- 输入：`A: string`、`B: string`
- 输出：`out: string`
- 源码：[StringConcatenate.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-strings/src/StringConcatenate.ts)

## `string/contains` — Contains {#string-contains}

Calls a.indexOf(b)

- 输入：`A: string`、`B: string`
- 输出：`contains: string`
- 源码：[StringContains.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-strings/src/StringContains.ts)

## `string/json_parse` — JSON Parse {#string-json-parse}

Parses a string into a JavaScript object

- 输入：`in: string`
- 输出：`out: *`、`error: string`
- 源码：[JSONParse.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-strings/src/JSONParse.ts)

## `string/json_stringify` — JSON Stringify {#string-json-stringify}

Calls JSON.stringify() on the input value

- 输入：`in: *`
- 输出：`out: string`、`error: string`
- 属性：`space`
- 源码：[JSONStringify.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-strings/src/JSONStringify.ts)

## `string/split` — Split {#string-split}

Calls str.split(sep \|\| " ")

- 输入：`in: string,array`、`sep: string`
- 输出：`out: array`
- 属性：`separator`
- 源码：[StringSplit.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-strings/src/StringSplit.ts)

## `string/template` — Template {#string-template}

Substitutes an array of strings in a template like '$1, $2, $3'

- 输入：`—: string,array`、`—: string`、`update: action`
- 输出：`out: string`、`changed: event`
- 控件：`Template: text`
- 属性：`template`、`stringQuote`、`outputJSON`
- 源码：[StringTemplate.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-strings/src/StringTemplate.ts)

## `string/toFixed` — ToFixed {#string-tofixed}

Calls in.toFixed()

- 输入：`in: number`
- 输出：`out: string`
- 属性：`precision`
- 源码：[StringToFixed.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-strings/src/StringToFixed.ts)

## `string/toLowerCase` — ToLowerCase {#string-tolowercase}

Converts to lower case

- 输入：`in: string`
- 输出：`out: string`
- 源码：[StringToLowerCase.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-strings/src/StringToLowerCase.ts)

## `string/toString` — ToString {#string-tostring}

Calls .toString()

- 输入：`in: any`
- 输出：`out: string`
- 源码：[OtherToString.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-strings/src/OtherToString.ts)

## `string/toTable` — ToTable {#string-totable}

Splits a string to table

- 输入：`in: number`
- 输出：`table: table`、`rows: number`
- 属性：`value`、`separator`
- 源码：[StringToTable.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-strings/src/StringToTable.ts)

## `string/toUpperCase` — ToUpperCase {#string-touppercase}

Converts to upper case

- 输入：`in: string`
- 输出：`out: string`
- 源码：[StringToUpperCase.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-strings/src/StringToUpperCase.ts)
