<!-- 此文件由 scripts/gen-node-catalog.mjs 从源码生成，请勿手工编辑。 -->

# 节点目录：nodes-audio

共 **17** 个节点。以下内容由 `scripts/gen-node-catalog.mjs` 从 [packages/nodes-audio/src/install.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-audio/src/install.ts) 提取。

槽位类型中的 `number`、`string`、`boolean` 等为普通数据端口，`event` 为事件端口；控件是绘制在节点上的交互组件，属性会随图一起序列化。

## `audio/adsr` — ADSR {#audio-adsr}

Audio envelope

- 输入：`in: audio`、`gate: boolean`
- 输出：`out: audio`
- 源码：[LGAudioADSR.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-audio/src/LGAudioADSR.ts)

## `audio/analyser` — Analyser {#audio-analyser}

Audio Analyser

- 输入：`in: audio`
- 输出：`freqs: array`、`samples: array`
- 源码：[LGAudioAnalyser.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-audio/src/LGAudioAnalyser.ts)

## `audio/biquadfilter` — BiquadFilter {#audio-biquadfilter}

Audio filter

- 输入：`in: audio`
- 输出：`out: audio`
- 属性：`type`
- 源码：[LGAudioBiquadFilter.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-audio/src/LGAudioBiquadFilter.ts)

## `audio/convolver` — Convolver {#audio-convolver}

Convolves the signal (used for reverb)

- 输入：`in: audio`
- 输出：`out: audio`
- 源码：[LGAudioConvolver.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-audio/src/LGAudioConvolver.ts)

## `audio/delay` — Delay {#audio-delay}

Audio delay

- 输入：`in: audio`、`time: number`
- 输出：`out: audio`
- 源码：[LGAudioDelay.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-audio/src/LGAudioDelay.ts)

## `audio/destination` — Destination {#audio-destination}

Audio output

- 输入：`in: audio`
- 输出：无
- 源码：[LGAudioDestination.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-audio/src/LGAudioDestination.ts)

## `audio/dynamicsCompressor` — DynamicsCompressor {#audio-dynamicscompressor}

Dynamics Compressor

- 输入：`in: audio`
- 输出：`out: audio`
- 源码：[LGAudioDynamicsCompressor.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-audio/src/LGAudioDynamicsCompressor.ts)

## `audio/gain` — Gain {#audio-gain}

Audio gain

- 输入：`in: audio`、`gain: number`
- 输出：`out: audio`
- 源码：[LGAudioGain.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-audio/src/LGAudioGain.ts)

## `audio/media_source` — MediaSource {#audio-media-source}

Plays microphone

- 输入：`gain: number`
- 输出：`out: audio`
- 源码：[LGAudioMediaSource.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-audio/src/LGAudioMediaSource.ts)

## `audio/mixer` — Mixer {#audio-mixer}

Audio mixer

- 输入：`in1: audio`、`in1 gain: number`、`in2: audio`、`in2 gain: number`
- 输出：`out: audio`
- 源码：[LGAudioMixer.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-audio/src/LGAudioMixer.ts)

## `audio/oscillator` — Oscillator {#audio-oscillator}

Oscillator

- 输入：无
- 输出：`out: audio`
- 属性：`type`
- 源码：[LGAudioOscillatorNode.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-audio/src/LGAudioOscillatorNode.ts)

## `audio/oscilloscope` — Oscilloscope {#audio-oscilloscope}

Audio oscilloscope

- 输入：`xy: buffer`
- 输出：无
- 源码：[LGAudioOscilloscope.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-audio/src/LGAudioOscilloscope.ts)

## `audio/script` — Script {#audio-script}

apply script to signal

- 输入：`in: audio`
- 输出：`out: audio`
- 源码：[LGAudioScript.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-audio/src/LGAudioScript.ts)

## `audio/signal` — Signal {#audio-signal}

extract the signal of some frequency

- 输入：`freqs: array`
- 输出：`signal: number`
- 源码：[LGAudioBandSignal.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-audio/src/LGAudioBandSignal.ts)

## `audio/source` — Audio Source {#audio-source}

Plays audio

- 输入：`gain: number`
- 输出：`out: audio`、`buffer: buffer`
- 源码：[LGAudioSource.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-audio/src/LGAudioSource.ts)

## `audio/visualization` — Visualization {#audio-visualization}

Audio Visualization

- 输入：`data: array`、`mark: number`
- 输出：无
- 源码：[LGAudioVisualization.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-audio/src/LGAudioVisualization.ts)

## `audio/waveShaper` — WaveShaper {#audio-waveshaper}

Distortion using wave shape

- 输入：`in: audio`、`shape: waveshape`
- 输出：`out: audio`
- 源码：[LGAudioWaveShaper.ts](https://github.com/gausszhou/litegraph/blob/master/packages/nodes-audio/src/LGAudioWaveShaper.ts)
