import { LGraph, LiteGraph } from "@gausszhou/litegraph";

export function basic1(graph: LGraph) {
  graph.clear();
  const node_const_A = LiteGraph.createNode<any>("basic/number");
  node_const_A.pos = [200, 100];
  node_const_A.setValue(5);
  
  const node_watch1 = LiteGraph.createNode<any>("basic/watch");
  node_watch1.pos = [500, 100];

  graph.add(node_const_A);
  graph.add(node_watch1);
  node_const_A.connect(0, node_watch1, 0);
}

export function basic2(graph: LGraph) {
  graph.clear()
  var node_const_A = LiteGraph.createNode<any>("basic/number");
  node_const_A.pos = [200, 100];
  node_const_A.setValue(5);
  
  var node_const_B = LiteGraph.createNode<any>("basic/number");
  node_const_B.pos = [200, 200];
  node_const_B.setValue(10);
  
  var node_watch1 = LiteGraph.createNode("basic/watch");
  node_watch1.pos = [500, 100];

  var node_watch2 = LiteGraph.createNode("basic/watch");
  node_watch2.pos = [500, 200];
  
  graph.add(node_const_A);
  graph.add(node_const_B);
  graph.add(node_watch1);
  graph.add(node_watch2);
  node_const_A.connect(0, node_watch1, 0);
  node_const_B.connect(0, node_watch2, 0);
}

export function basic3(graph: LGraph) {
  graph.clear()
  var node_const_A = LiteGraph.createNode<any>("basic/number");
  node_const_A.pos = [200, 100];
  node_const_A.setValue(5);
  
  var node_const_B = LiteGraph.createNode<any>("basic/number");
  node_const_B.pos = [200, 200];
  node_const_B.setValue(10);
  
  var node_watch1 = LiteGraph.createNode("basic/watch");
  node_watch1.pos = [500, 100];
  
  var node_watch2 = LiteGraph.createNode("basic/watch");
  node_watch2.pos = [500, 200];
  
  var node_math = LiteGraph.createNode("math/operation");
  node_math.pos = [500, 300];
  
  var node_watch3 = LiteGraph.createNode("basic/watch");
  node_watch3.pos = [700, 100];
  
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
  node_audio_source.pos = [200, 100];
  node_audio_source.setProperty("src", "./demodata/audio.wav")

  const node_audio_dest = LiteGraph.createNode("audio/destination");
  node_audio_dest.pos = [400, 100];

  graph.add(node_audio_source);
  graph.add(node_audio_dest);
  node_audio_source.connect(0, node_audio_dest, 0)

}

export function audio2(graph: LGraph) {
  graph.clear()

  const node_audio_gain = LiteGraph.createNode("widget/knob");
  node_audio_gain.pos = [50, 50];

  const node_audio_source = LiteGraph.createNode("audio/source");
  node_audio_source.pos = [200, 50];
  node_audio_source.setProperty("src", "./demodata/audio.wav")
  
  const node_audio_dest = LiteGraph.createNode("audio/destination");
  node_audio_dest.pos = [400, 50];

  const node_audio_analyser = LiteGraph.createNode("audio/analyser");
  node_audio_analyser.pos = [400, 300];

  const node_audio_vis = LiteGraph.createNode("audio/visualization");
  node_audio_vis.pos = [600, 50];

  const node_audio_vis2 = LiteGraph.createNode("audio/visualization");
  node_audio_vis2.pos = [600, 300];
  
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

export function audio3(graph: LGraph) {

  graph.clear()

  const node_audio_gain = LiteGraph.createNode("widget/knob");
  node_audio_gain.pos = [50, 50];

  const node_audio_source = LiteGraph.createNode("audio/source");
  node_audio_source.pos = [200, 50];
  node_audio_source.setProperty("src", "./demodata/oscillofun.mp3")
  
  const node_audio_dest = LiteGraph.createNode("audio/destination");
  node_audio_dest.pos = [400, 50];

  const node_audio_analyser = LiteGraph.createNode("audio/analyser");
  node_audio_analyser.pos = [400, 100];

  const node_audio_vis = LiteGraph.createNode("audio/visualization");
  node_audio_vis.pos = [600, 50];

  const node_audio_vis2 = LiteGraph.createNode("audio/visualization");
  node_audio_vis2.pos = [600, 300];

  const node_audio_oscillo = LiteGraph.createNode("audio/oscilloscope");
  node_audio_oscillo.pos = [200, 200];
  node_audio_oscillo.size = [300, 300]
  
  graph.add(node_audio_gain);
  graph.add(node_audio_source);
  graph.add(node_audio_dest);
  graph.add(node_audio_analyser);
  graph.add(node_audio_vis);
  graph.add(node_audio_vis2);
  graph.add(node_audio_oscillo);

  node_audio_gain.connect(0, node_audio_source, 0)
  node_audio_source.connect(0, node_audio_dest, 0)
  node_audio_source.connect(0, node_audio_analyser, 0)
  node_audio_analyser.connect(0, node_audio_vis, 0)
  node_audio_analyser.connect(1, node_audio_vis2, 0)
  node_audio_source.connect(1, node_audio_oscillo, 0)
  


}


export function circuit1(graph: LGraph) {
  graph.clear();
  const node_oscillator = LiteGraph.createNode<any>("circuit/oscillator");
  node_oscillator.pos = [200, 100];
  
  
  const node_led = LiteGraph.createNode<any>("circuit/led");
  node_led.pos = [500, 100];

  graph.add(node_oscillator);
  graph.add(node_led);
  node_oscillator.connect(0, node_led, 0);
}