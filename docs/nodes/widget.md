<!-- 此文件由 scripts/gen-node-catalog.mjs 从源码生成，请勿手工编辑。 -->

# 节点目录：nodes-widget

共 **10** 个节点。以下内容由 `scripts/gen-node-catalog.mjs` 从 [packages/nodes-widget/src/install.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-widget/src/install.ts) 提取。

槽位类型中的 `number`、`string`、`boolean` 等为普通数据端口，`event` 为事件端口；控件是绘制在节点上的交互组件，属性会随图一起序列化。

## `widget/button` — Button {#widget-button}

Triggers an event

- 输入：无
- 输出：`—: event`、`—: boolean`
- 属性：`text`、`font_size`、`message`
- 源码：[WidgetButton.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-widget/src/WidgetButton.ts)

## `widget/combo` — Combo {#widget-combo}

Widget to select from a list

- 输入：无
- 输出：`—: string`、`change: event`
- 控件：`—: combo`
- 源码：[WidgetCombo.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-widget/src/WidgetCombo.ts)

## `widget/hslider` — H.Slider {#widget-hslider}

Linear slider controller

- 输入：无
- 输出：`—: number`
- 源码：[WidgetHSlider.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-widget/src/WidgetHSlider.ts)

## `widget/internal_slider` — Inner Slider {#widget-internal-slider}

（无说明）

- 输入：无
- 输出：`—: number`
- 控件：`V: slider`
- 源码：[WidgetSliderGUI.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-widget/src/WidgetSliderGUI.ts)

## `widget/knob` — Knob {#widget-knob}

Circular controller

- 输入：无
- 输出：`—: number`
- 源码：[WidgetKnob.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-widget/src/WidgetKnob.ts)

## `widget/number` — Number {#widget-number}

Widget to select number value

- 输入：无
- 输出：`—: number`
- 源码：[WidgetNumber.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-widget/src/WidgetNumber.ts)

## `widget/panel` — Panel {#widget-panel}

Non interactive panel

- 输入：无
- 输出：无
- 源码：[WidgetPanel.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-widget/src/WidgetPanel.ts)

## `widget/progress` — Progress {#widget-progress}

Shows data in linear progress

- 输入：`—: number`
- 输出：无
- 源码：[WidgetProgress.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-widget/src/WidgetProgress.ts)

## `widget/text` — Text {#widget-text}

Shows the input value

- 输入：`—: 0`
- 输出：无
- 源码：[WidgetText.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-widget/src/WidgetText.ts)

## `widget/toggle` — Toggle {#widget-toggle}

Toggles between true or false

- 输入：`—: boolean`、`e: action`
- 输出：`v: boolean`、`e: event`
- 源码：[WidgetToggle.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-widget/src/WidgetToggle.ts)
