<!-- 此文件由 scripts/gen-node-catalog.mjs 从源码生成，请勿手工编辑。 -->

# 节点目录：nodes-events

共 **10** 个节点。以下内容由 `scripts/gen-node-catalog.mjs` 从 [packages/nodes-events/src/install.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-events/src/install.ts) 提取。

槽位类型中的 `number`、`string`、`boolean` 等为普通数据端口，`event` 为事件端口；控件是绘制在节点上的交互组件，属性会随图一起序列化。

## `events/branch` — Branch {#events-branch}

If condition is true, outputs triggers true, otherwise false

- 输入：`in: action`、`cond: boolean`
- 输出：`true: event`、`false: event`
- 源码：[EventBranch.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-events/src/EventBranch.ts)

## `events/counter` — Counter {#events-counter}

Counts events

- 输入：`inc: action`、`dec: action`、`reset: action`
- 输出：`change: event`、`num: number`
- 控件：`Count Exec.: toggle`
- 属性：`doCountExecution`
- 源码：[EventCounter.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-events/src/EventCounter.ts)

## `events/delay` — Delay {#events-delay}

Delays one event

- 输入：`event: action`
- 输出：`on_time: event`
- 属性：`timeInMs`
- 源码：[EventDelay.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-events/src/EventDelay.ts)

## `events/filter` — Filter Event {#events-filter}

Blocks events that do not match the filter

- 输入：`event: action`、`compare_value: *`
- 输出：`accept: event`、`reject: event`
- 控件：`Mode: combo`、`Prop.: text`、`Op.: combo`、`Value: text`
- 属性：`compareValue`、`propertyName`、`mode`、`operation`
- 源码：[EventFilter.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-events/src/EventFilter.ts)

## `events/frame_delay` — Frame Delay {#events-frame-delay}

Delays one event by frame count

- 输入：`event: action`
- 输出：`on_time: event`
- 属性：`timeInFrames`
- 源码：[EventFrameDelay.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-events/src/EventFrameDelay.ts)

## `events/log` — Log Event {#events-log}

Log event in console

- 输入：`event: action`
- 输出：无
- 控件：`Action: text`、`Param: text`、`Opts: text`
- 源码：[EventLog.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-events/src/EventLog.ts)

## `events/sequence` — Sequence {#events-sequence}

Triggers a sequence of events when an event arrives

- 输入：`—: action`
- 输出：`—: event`
- 源码：[Sequence.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-events/src/Sequence.ts)

## `events/timer` — Timer {#events-timer}

Sends an event every N milliseconds

- 输入：无
- 输出：`on_tick: event`
- 属性：`interval`、`event`
- 源码：[TimerEvent.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-events/src/TimerEvent.ts)

## `events/trigger` — Trigger Event {#events-trigger}

Triggers event if input evaluates to true

- 输入：`if: any`
- 输出：`true: event`、`change: event`、`false: event`
- 属性：`onlyOnChange`
- 源码：[TriggerEvent.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-events/src/TriggerEvent.ts)

## `events/wrap_as_event` — Wrap As Event {#events-wrap-as-event}

Triggers an event setting its parameter to the input value

- 输入：`trigger: action`、`param: any`
- 输出：`event: event`
- 源码：[WrapAsEvent.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-events/src/WrapAsEvent.ts)
