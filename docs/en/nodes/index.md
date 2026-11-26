<!-- Generated from source by scripts/gen-node-catalog.mjs. Do not edit manually. -->

# Node Catalog

LiteGraph ships 10 node packs with **92** nodes; the core adds 3 built-in nodes (graph input/output and subgraph), for **95** node types in total.

Node packs are optional plugins and must be installed explicitly with `install(LiteGraph)` or `LiteGraph.use(install)`. The aggregate package `@gausszhou/litegraph` installs every pack automatically.

| Pack | Nodes | Type prefixes | Catalog |
| --- | --- | --- | --- |
| Core built-ins | 3 | `graph/*` | [Core built-ins](./core.md) |
| nodes-audio | 17 | `audio/*` | [nodes-audio](./audio.md) |
| nodes-basic | 16 | `basic/*` | [nodes-basic](./basic.md) |
| nodes-events | 10 | `events/*` | [nodes-events](./events.md) |
| nodes-graphics | 1 | `graphics/*` | [nodes-graphics](./graphics.md) |
| nodes-input | 1 | `input/*` | [nodes-input](./input.md) |
| nodes-logic | 8 | `logic/*` | [nodes-logic](./logic.md) |
| nodes-math | 5 | `math/*` | [nodes-math](./math.md) |
| nodes-midi | 12 | `midi/*` | [nodes-midi](./midi.md) |
| nodes-strings | 12 | `string/*` | [nodes-strings](./strings.md) |
| nodes-widget | 10 | `widget/*` | [nodes-widget](./widget.md) |

## All types

- `graph/input` — Input ([Core built-ins](./core.md#graph-input))
- `graph/output` — Output ([Core built-ins](./core.md#graph-output))
- `graph/subgraph` — Subgraph ([Core built-ins](./core.md#graph-subgraph))
- `audio/adsr` — ADSR ([nodes-audio](./audio.md#audio-adsr))
- `audio/analyser` — Analyser ([nodes-audio](./audio.md#audio-analyser))
- `audio/biquadfilter` — BiquadFilter ([nodes-audio](./audio.md#audio-biquadfilter))
- `audio/convolver` — Convolver ([nodes-audio](./audio.md#audio-convolver))
- `audio/delay` — Delay ([nodes-audio](./audio.md#audio-delay))
- `audio/destination` — Destination ([nodes-audio](./audio.md#audio-destination))
- `audio/dynamicsCompressor` — DynamicsCompressor ([nodes-audio](./audio.md#audio-dynamicscompressor))
- `audio/gain` — Gain ([nodes-audio](./audio.md#audio-gain))
- `audio/media_source` — MediaSource ([nodes-audio](./audio.md#audio-media-source))
- `audio/mixer` — Mixer ([nodes-audio](./audio.md#audio-mixer))
- `audio/oscillator` — Oscillator ([nodes-audio](./audio.md#audio-oscillator))
- `audio/oscilloscope` — Oscilloscope ([nodes-audio](./audio.md#audio-oscilloscope))
- `audio/script` — Script ([nodes-audio](./audio.md#audio-script))
- `audio/signal` — Signal ([nodes-audio](./audio.md#audio-signal))
- `audio/source` — Audio Source ([nodes-audio](./audio.md#audio-source))
- `audio/visualization` — Visualization ([nodes-audio](./audio.md#audio-visualization))
- `audio/waveShaper` — WaveShaper ([nodes-audio](./audio.md#audio-waveshaper))
- `basic/CompareValues` — GenericCompare ([nodes-basic](./basic.md#basic-comparevalues))
- `basic/array[]` — Array[i] ([nodes-basic](./basic.md#basic-array))
- `basic/boolean` — Const Boolean ([nodes-basic](./basic.md#basic-boolean))
- `basic/const` — Const Number ([nodes-basic](./basic.md#basic-const))
- `basic/file` — Const File ([nodes-basic](./basic.md#basic-file))
- `basic/integer` — Const Integer ([nodes-basic](./basic.md#basic-integer))
- `basic/is_null` — == Null ([nodes-basic](./basic.md#basic-is-null))
- `basic/json` — Const JSON ([nodes-basic](./basic.md#basic-json))
- `basic/null` — Const Null ([nodes-basic](./basic.md#basic-null))
- `basic/number` — Const Number ([nodes-basic](./basic.md#basic-number))
- `basic/object` — Const Object ([nodes-basic](./basic.md#basic-object))
- `basic/reroute` — Reroute ([nodes-basic](./basic.md#basic-reroute))
- `basic/set_array` — Set Array ([nodes-basic](./basic.md#basic-set-array))
- `basic/string` — Const String ([nodes-basic](./basic.md#basic-string))
- `basic/time` — Time ([nodes-basic](./basic.md#basic-time))
- `basic/watch` — Watch ([nodes-basic](./basic.md#basic-watch))
- `events/branch` — Branch ([nodes-events](./events.md#events-branch))
- `events/counter` — Counter ([nodes-events](./events.md#events-counter))
- `events/delay` — Delay ([nodes-events](./events.md#events-delay))
- `events/filter` — Filter Event ([nodes-events](./events.md#events-filter))
- `events/frame_delay` — Frame Delay ([nodes-events](./events.md#events-frame-delay))
- `events/log` — Log Event ([nodes-events](./events.md#events-log))
- `events/sequence` — Sequence ([nodes-events](./events.md#events-sequence))
- `events/timer` — Timer ([nodes-events](./events.md#events-timer))
- `events/trigger` — Trigger Event ([nodes-events](./events.md#events-trigger))
- `events/wrap_as_event` — Wrap As Event ([nodes-events](./events.md#events-wrap-as-event))
- `graphics/plot` — Plot ([nodes-graphics](./graphics.md#graphics-plot))
- `input/gamepad` — Gamepad ([nodes-input](./input.md#input-gamepad))
- `logic/and` — AND ([nodes-logic](./logic.md#logic-and))
- `logic/branch` — Branch ([nodes-logic](./logic.md#logic-branch))
- `logic/compare` — Compare ([nodes-logic](./logic.md#logic-compare))
- `logic/not` — NOT ([nodes-logic](./logic.md#logic-not))
- `logic/or` — OR ([nodes-logic](./logic.md#logic-or))
- `logic/selector` — Selector ([nodes-logic](./logic.md#logic-selector))
- `logic/sequence` — Sequence ([nodes-logic](./logic.md#logic-sequence))
- `logic/truthy` — ~= TRUE ([nodes-logic](./logic.md#logic-truthy))
- `math/approx_eq` — Approx. Eq ([nodes-math](./math.md#math-approx-eq))
- `math/floor` — Floor ([nodes-math](./math.md#math-floor))
- `math/noise` — Noise ([nodes-math](./math.md#math-noise))
- `math/operation` — Operation ([nodes-math](./math.md#math-operation))
- `math/rand` — Rand ([nodes-math](./math.md#math-rand))
- `midi/cc` — MIDICC ([nodes-midi](./midi.md#midi-cc))
- `midi/event` — MIDIEvent ([nodes-midi](./midi.md#midi-event))
- `midi/filter` — MIDI Filter ([nodes-midi](./midi.md#midi-filter))
- `midi/fromFile` — MIDI fromFile ([nodes-midi](./midi.md#midi-fromfile))
- `midi/generator` — MIDI Generator ([nodes-midi](./midi.md#midi-generator))
- `midi/input` — MIDI Input ([nodes-midi](./midi.md#midi-input))
- `midi/keys` — MIDI Keys ([nodes-midi](./midi.md#midi-keys))
- `midi/output` — MIDI Output ([nodes-midi](./midi.md#midi-output))
- `midi/play` — MIDI Play ([nodes-midi](./midi.md#midi-play))
- `midi/quantize` — MIDI Quantize Pitch ([nodes-midi](./midi.md#midi-quantize))
- `midi/show` — MIDI Show ([nodes-midi](./midi.md#midi-show))
- `midi/transpose` — MIDI Transpose ([nodes-midi](./midi.md#midi-transpose))
- `string/compare` — Compare ([nodes-strings](./strings.md#string-compare))
- `string/concatenate` — Concatenate ([nodes-strings](./strings.md#string-concatenate))
- `string/contains` — Contains ([nodes-strings](./strings.md#string-contains))
- `string/json_parse` — JSON Parse ([nodes-strings](./strings.md#string-json-parse))
- `string/json_stringify` — JSON Stringify ([nodes-strings](./strings.md#string-json-stringify))
- `string/split` — Split ([nodes-strings](./strings.md#string-split))
- `string/template` — Template ([nodes-strings](./strings.md#string-template))
- `string/toFixed` — ToFixed ([nodes-strings](./strings.md#string-tofixed))
- `string/toLowerCase` — ToLowerCase ([nodes-strings](./strings.md#string-tolowercase))
- `string/toString` — ToString ([nodes-strings](./strings.md#string-tostring))
- `string/toTable` — ToTable ([nodes-strings](./strings.md#string-totable))
- `string/toUpperCase` — ToUpperCase ([nodes-strings](./strings.md#string-touppercase))
- `widget/button` — Button ([nodes-widget](./widget.md#widget-button))
- `widget/combo` — Combo ([nodes-widget](./widget.md#widget-combo))
- `widget/hslider` — H.Slider ([nodes-widget](./widget.md#widget-hslider))
- `widget/internal_slider` — Inner Slider ([nodes-widget](./widget.md#widget-internal-slider))
- `widget/knob` — Knob ([nodes-widget](./widget.md#widget-knob))
- `widget/number` — Number ([nodes-widget](./widget.md#widget-number))
- `widget/panel` — Panel ([nodes-widget](./widget.md#widget-panel))
- `widget/progress` — Progress ([nodes-widget](./widget.md#widget-progress))
- `widget/text` — Text ([nodes-widget](./widget.md#widget-text))
- `widget/toggle` — Toggle ([nodes-widget](./widget.md#widget-toggle))
