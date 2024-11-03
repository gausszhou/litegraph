import { LGraph, LiteGraph } from "@gausszhou/litegraph";
import { ConstantNumber, Watch } from "@gausszhou/litegraph-nodes-basic"
import { MathOperation } from "@gausszhou/litegraph-nodes-math"

export function demo1(graph: LGraph) {

  graph.clear();
  const node_const_A = LiteGraph.createNode<ConstantNumber>("basic/number");
  node_const_A.pos = [200, 200];
  node_const_A.setValue(5);
  
  const node_watch1 = LiteGraph.createNode<Watch>("basic/watch");
  node_watch1.pos = [500, 200];

  graph.add(node_const_A);
  graph.add(node_watch1);
  node_const_A.connect(0, node_watch1, 0);
}

export function demo2(graph: LGraph) {
  graph.clear()
  var node_const_A = LiteGraph.createNode<ConstantNumber>("basic/number");
  node_const_A.pos = [200, 200];
  node_const_A.setValue(5);
  
  var node_const_B = LiteGraph.createNode(ConstantNumber);
  node_const_B.pos = [200, 300];
  node_const_B.setValue(10);
  
  var node_watch1 = LiteGraph.createNode("basic/watch");
  node_watch1.pos = [500, 200];

  var node_watch2 = LiteGraph.createNode(Watch);
  node_watch2.pos = [500, 300];
  
  graph.add(node_const_A);
  graph.add(node_const_B);
  graph.add(node_watch1);
  graph.add(node_watch2);
  node_const_A.connect(0, node_watch1, 0);
  node_const_B.connect(0, node_watch2, 0);
}

export function demo3(graph: LGraph) {
  graph.clear()
  var node_const_A = LiteGraph.createNode<ConstantNumber>("basic/number");
  node_const_A.pos = [200, 200];
  node_const_A.setValue(5);
  
  var node_const_B = LiteGraph.createNode(ConstantNumber);
  node_const_B.pos = [200, 300];
  node_const_B.setValue(10);
  
  var node_watch1 = LiteGraph.createNode("basic/watch");
  node_watch1.pos = [500, 200];
  
  var node_watch2 = LiteGraph.createNode(Watch);
  node_watch2.pos = [500, 300];
  
  var node_math = LiteGraph.createNode(MathOperation);
  node_math.pos = [500, 400];
  
  var node_watch3 = LiteGraph.createNode(Watch);
  node_watch3.pos = [700, 400];
  
  graph.add(node_const_A);
  graph.add(node_const_B);
  graph.add(node_watch1);
  graph.add(node_watch2);
  graph.add(node_math);
  graph.add(node_watch3);

  node_const_A.connect(0, node_math, 0);
  node_const_B.connect(0, node_math, 1);
  node_const_A.connect(0, node_watch1, 0);
  node_const_B.connect(0, node_watch2, 0);
  node_math.connect(0, node_watch3, 0);
}

export function audio1(graph: LGraph) {
  graph.clear()
  const node_audio_source = LiteGraph.createNode("audio/source");
  node_audio_source.pos = [200, 200];
  node_audio_source.setProperty("src", "demodata/audio.wav")

  const node_audio_dest = LiteGraph.createNode("audio/destination");
  node_audio_dest.pos = [400, 200];

  graph.add(node_audio_source);
  graph.add(node_audio_dest);
  node_audio_source.connect(0, node_audio_dest, 0)

}

export function audio2(graph: LGraph) {
  graph.clear()

  const node_audio_gain = LiteGraph.createNode("widget/knob");
  node_audio_gain.pos = [50, 100];

  const node_audio_source = LiteGraph.createNode("audio/source");
  node_audio_source.pos = [200, 100];
  node_audio_source.setProperty("src", "demodata/audio.wav")
  
  const node_audio_dest = LiteGraph.createNode("audio/destination");
  node_audio_dest.pos = [400, 100];

  const node_audio_analyser = LiteGraph.createNode("audio/analyser");
  node_audio_analyser.pos = [400, 300];

  const node_audio_vis = LiteGraph.createNode("audio/visualization");
  node_audio_vis.pos = [600, 100];

  const node_audio_vis2 = LiteGraph.createNode("audio/visualization");
  node_audio_vis2.pos = [600, 400];
  
  graph.add(node_audio_gain);
  graph.add(node_audio_source);
  graph.add(node_audio_dest);
  graph.add(node_audio_analyser);
  graph.add(node_audio_vis);
  graph.add(node_audio_vis2);

  node_audio_gain.connect(0, node_audio_source, 0)
  node_audio_source.connect(0, node_audio_dest, 0)
  node_audio_source.connect(0, node_audio_analyser, 0)
  node_audio_analyser.connect(0, node_audio_vis, 0)
  node_audio_analyser.connect(1, node_audio_vis2, 0)

}