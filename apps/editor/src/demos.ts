import { LGraph, LiteGraph } from "@gausszhou/litegraph";
import type { LGraphNode, Subgraph } from "@gausszhou/litegraph";

type Vec2 = [number, number];

/** 创建节点；类型未注册时立即报错，避免 demo 静默变成空图。 */
function createNode(type: string, pos: Vec2, size?: Vec2): LGraphNode {
  const node = LiteGraph.createNode(type);
  if (!node) {
    throw new Error(`[demo] 节点类型未注册：${type}`);
  }
  node.pos = pos;
  if (size) {
    node.size = size;
  }
  return node;
}

/** 创建并加入指定图（外层图或子图内部图）。 */
function addNode(graph: LGraph, type: string, pos: Vec2, size?: Vec2): LGraphNode {
  const node = createNode(type, pos, size);
  graph.add(node);
  return node;
}

/** 连接两个插槽；失败时抛错，方便在测试里发现示例失效。 */
function connect(from: LGraphNode, output: number, to: LGraphNode, input: number): void {
  if (!from.connect(output, to, input)) {
    throw new Error(`[demo] 连接失败：${from.type}[${output}] -> ${to.type}[${input}]`);
  }
}

export function basic1(graph: LGraph): void {
  graph.clear();
  const value = addNode(graph, "basic/number", [120, 120]);
  value.setProperty("value", 5);
  const watch = addNode(graph, "basic/watch", [440, 120]);
  connect(value, 0, watch, 0);
}

export function basic2(graph: LGraph): void {
  graph.clear();
  const a = addNode(graph, "basic/number", [120, 100]);
  a.setProperty("value", 5);
  const b = addNode(graph, "basic/number", [120, 220]);
  b.setProperty("value", 10);
  const watchA = addNode(graph, "basic/watch", [440, 100]);
  const watchB = addNode(graph, "basic/watch", [440, 220]);
  connect(a, 0, watchA, 0);
  connect(b, 0, watchB, 0);
}

export function basic3(graph: LGraph): void {
  graph.clear();
  const a = addNode(graph, "basic/number", [120, 80]);
  a.setProperty("value", 5);
  const b = addNode(graph, "basic/number", [120, 200]);
  b.setProperty("value", 10);
  const math = addNode(graph, "math/operation", [380, 160]);
  const watchA = addNode(graph, "basic/watch", [660, 80]);
  const watchB = addNode(graph, "basic/watch", [660, 200]);
  const watchSum = addNode(graph, "basic/watch", [660, 320]);
  connect(a, 0, watchA, 0);
  connect(b, 0, watchB, 0);
  connect(a, 0, math, 0);
  connect(b, 0, math, 1);
  connect(math, 0, watchSum, 0);
}

export function widgets(graph: LGraph): void {
  graph.clear();

  // 旋钮 -> 进度条：演示带可编辑属性的控件节点
  const knob = addNode(graph, "widget/knob", [100, 80]);
  knob.setProperty("value", 0.65);
  const progress = addNode(graph, "widget/progress", [400, 100]);
  connect(knob, 0, progress, 0);

  // 开关 -> watch：布尔控件节点的输出
  const toggle = addNode(graph, "widget/toggle", [100, 260]);
  const watch = addNode(graph, "basic/watch", [400, 260]);
  connect(toggle, 0, watch, 0);

  // 按钮事件 -> 日志：控件节点也可以发出 action
  const button = addNode(graph, "widget/button", [100, 400]);
  const log = addNode(graph, "events/log", [400, 420]);
  connect(button, 0, log, 0);
}

export function events(graph: LGraph): void {
  graph.clear();

  // 定时器每秒触发一次计数器，计数结果与每次 change 事件分别接到 watch / log
  const timer = addNode(graph, "events/timer", [120, 120]);
  timer.setProperty("interval", 1000);
  timer.setProperty("event", "tick");
  const counter = addNode(graph, "events/counter", [400, 100]);
  const watch = addNode(graph, "basic/watch", [720, 200]);
  const log = addNode(graph, "events/log", [400, 340]);
  connect(timer, 0, counter, 0);
  connect(counter, 1, watch, 0);
  connect(counter, 0, log, 0);
}

export function subgraph(graph: LGraph): void {
  graph.clear();

  const source = addNode(graph, "basic/number", [100, 140]);
  source.setProperty("value", 5);

  // 子图节点本身也是一张 LGraph：内部是「输入 + 常量 10 -> 求和 -> 输出」
  const sub = addNode(graph, "graph/subgraph", [380, 120], [220, 120]) as Subgraph;
  sub.title = "Add 10";
  const inner = sub.subgraph;

  const innerInput = createNode("graph/input", [80, 120]);
  inner.add(innerInput);
  innerInput.setProperty("type", "number");
  innerInput.setProperty("name", "value");

  const ten = addNode(inner, "basic/number", [80, 260]);
  ten.setProperty("value", 10);

  const sum = addNode(inner, "math/operation", [360, 160]);
  const innerOutput = createNode("graph/output", [620, 140]);
  inner.add(innerOutput);
  innerOutput.setProperty("type", "number");
  innerOutput.setProperty("name", "result");

  connect(innerInput, 0, sum, 0);
  connect(ten, 0, sum, 1);
  connect(sum, 0, innerOutput, 0);

  // 外层：常量 -> 子图 value -> 子图 result -> watch
  const watch = addNode(graph, "basic/watch", [720, 140]);
  connect(source, 0, sub, sub.findInputSlotIndexByName("value"));
  connect(sub, sub.findOutputSlotIndexByName("result"), watch, 0);
}

export function audio1(graph: LGraph): void {
  graph.clear();
  const source = addNode(graph, "audio/source", [140, 120]);
  source.setProperty("src", "./demodata/audio.wav");
  const destination = addNode(graph, "audio/destination", [480, 120]);
  connect(source, 0, destination, 0);
}

export function audio2(graph: LGraph): void {
  graph.clear();
  const gain = addNode(graph, "widget/knob", [80, 80]);
  const source = addNode(graph, "audio/source", [280, 80]);
  source.setProperty("src", "./demodata/audio.wav");
  const destination = addNode(graph, "audio/destination", [540, 80]);
  const analyser = addNode(graph, "audio/analyser", [540, 280]);
  const visualizeFreq = addNode(graph, "audio/visualization", [820, 240]);
  const visualizeWave = addNode(graph, "audio/visualization", [1060, 240]);

  connect(gain, 0, source, 0);
  connect(source, 0, destination, 0);
  connect(source, 0, analyser, 0);
  connect(analyser, 0, visualizeFreq, 0);
  connect(analyser, 1, visualizeWave, 0);
}

export function audio3(graph: LGraph): void {
  graph.clear();
  const gain = addNode(graph, "widget/knob", [80, 80]);
  const source = addNode(graph, "audio/source", [280, 80]);
  source.setProperty("src", "./demodata/oscillofun.mp3");
  const destination = addNode(graph, "audio/destination", [540, 80]);
  const oscilloscope = addNode(graph, "audio/oscilloscope", [80, 240], [320, 220]);
  const analyser = addNode(graph, "audio/analyser", [540, 280]);
  const visualizeFreq = addNode(graph, "audio/visualization", [820, 240]);
  const visualizeWave = addNode(graph, "audio/visualization", [1060, 240]);

  connect(gain, 0, source, 0);
  connect(source, 0, destination, 0);
  connect(source, 0, analyser, 0);
  connect(analyser, 0, visualizeFreq, 0);
  connect(analyser, 1, visualizeWave, 0);
  connect(source, 1, oscilloscope, 0);
}

export function circuit1(graph: LGraph): void {
  graph.clear();
  const oscillator = addNode(graph, "circuit/oscillator", [140, 120]);
  const led = addNode(graph, "circuit/led", [480, 120]);
  connect(oscillator, 0, led, 0);
}
