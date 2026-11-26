<!-- 此文件由 scripts/gen-node-catalog.mjs 从源码生成，请勿手工编辑。 -->

# 节点目录：nodes-midi

共 **12** 个节点。以下内容由 `scripts/gen-node-catalog.mjs` 从 [packages/nodes-midi/src/install.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-midi/src/install.ts) 提取。

槽位类型中的 `number`、`string`、`boolean` 等为普通数据端口，`event` 为事件端口；控件是绘制在节点上的交互组件，属性会随图一起序列化。

## `midi/cc` — MIDICC {#midi-cc}

gets a Controller Change

- 输入：无
- 输出：`value: number`
- 源码：[LGMIDICC.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-midi/src/LGMIDICC.ts)

## `midi/event` — MIDIEvent {#midi-event}

Create a MIDI Event

- 输入：`send: event`、`assign: event`
- 输出：`on_midi: event`
- 源码：[LGMIDIEvent.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-midi/src/LGMIDIEvent.ts)

## `midi/filter` — MIDI Filter {#midi-filter}

Filters MIDI messages

- 输入：`in: event`
- 输出：`on_midi: event`
- 控件：`Learn: button`
- 源码：[LGMIDIFilter.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-midi/src/LGMIDIFilter.ts)

## `midi/fromFile` — MIDI fromFile {#midi-fromfile}

Plays a MIDI file

- 输入：`play: action`、`pause: action`
- 输出：`note: event`
- 源码：[LGMIDIFromFile.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-midi/src/LGMIDIFromFile.ts)

## `midi/generator` — MIDI Generator {#midi-generator}

Generates a random MIDI note

- 输入：`generate: action`、`scale: string`、`octave: number`
- 输出：`note: event`
- 源码：[LGMIDIGenerator.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-midi/src/LGMIDIGenerator.ts)

## `midi/input` — MIDI Input {#midi-input}

Reads MIDI from a input port

- 输入：无
- 输出：`on_midi: event`、`out: midi`
- 源码：[LGMIDIIn.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-midi/src/LGMIDIIn.ts)

## `midi/keys` — MIDI Keys {#midi-keys}

Keyboard to play notes

- 输入：`note: action`、`reset: action`
- 输出：`note: event`
- 源码：[LGMIDIKeys.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-midi/src/LGMIDIKeys.ts)

## `midi/output` — MIDI Output {#midi-output}

Sends MIDI to output channel

- 输入：`send: event`
- 输出：无
- 控件：`Device: combo`
- 源码：[LGMIDIOut.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-midi/src/LGMIDIOut.ts)

## `midi/play` — MIDI Play {#midi-play}

Plays a MIDI note

- 输入：`note: action`、`volume: number`、`duration: number`
- 输出：`note: event`
- 源码：[LGMIDIPlay.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-midi/src/LGMIDIPlay.ts)

## `midi/quantize` — MIDI Quantize Pitch {#midi-quantize}

Transpose a MIDI note tp fit an scale

- 输入：`note: action`、`scale: string`
- 输出：`out: event`
- 源码：[LGMIDIQuantize.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-midi/src/LGMIDIQuantize.ts)

## `midi/show` — MIDI Show {#midi-show}

Shows MIDI in the graph

- 输入：`on_midi: event`
- 输出：无
- 源码：[LGMIDIShow.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-midi/src/LGMIDIShow.ts)

## `midi/transpose` — MIDI Transpose {#midi-transpose}

Transpose a MIDI note

- 输入：`in: action`、`amount: number`
- 输出：`out: event`
- 源码：[LGMIDITranspose.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-midi/src/LGMIDITranspose.ts)
