<!-- 此文件由 scripts/gen-node-catalog.mjs 从源码生成，请勿手工编辑。 -->

# 节点目录：nodes-input

共 **1** 个节点。以下内容由 `scripts/gen-node-catalog.mjs` 从 [packages/nodes-input/src/install.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-input/src/install.ts) 提取。

槽位类型中的 `number`、`string`、`boolean` 等为普通数据端口，`event` 为事件端口；控件是绘制在节点上的交互组件，属性会随图一起序列化。

## `input/gamepad` — Gamepad {#input-gamepad}

gets the input of the gamepad

- 输入：无
- 输出：`left_x_axis: number`、`left_y_axis: number`、`button_pressed: event`
- 源码：[Gamepad.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-input/src/Gamepad.ts)
