import { LGraph, LiteGraph } from "@gausszhou/litegraph";
import { ConstantNumber, Watch } from "@gausszhou/litegraph-nodes-basic"
import { MathOperation } from "@gausszhou/litegraph-nodes-math"

export function demo1(graph: LGraph) {
  graph.clear();
  const node_const_A = LiteGraph.createNode<ConstantNumber>("basic/number");
  node_const_A.pos = [200, 200];
  node_const_A.setValue(10);
  graph.add(node_const_A);

  const node_watch1 = LiteGraph.createNode<Watch>("basic/watch");
  node_watch1.pos = [500, 200];
  graph.add(node_watch1);

  node_const_A.connect(0, node_watch1, 0);
}

export function demo2(graph: LGraph) {
  graph.clear()
  var node_const_A = LiteGraph.createNode<ConstantNumber>("basic/number");
  node_const_A.pos = [200, 200];
  node_const_A.setValue(10);
  graph.add(node_const_A);

  var node_const_B = LiteGraph.createNode(ConstantNumber);
  node_const_B.pos = [200, 300];
  node_const_B.setValue(10);
  graph.add(node_const_B);

  var node_watch1 = LiteGraph.createNode("basic/watch");
  node_watch1.pos = [500, 200];
  graph.add(node_watch1);

  var node_watch2 = LiteGraph.createNode(Watch);
  node_watch2.pos = [500, 300];
  graph.add(node_watch2);

  node_const_A.connect(0, node_watch1, 0);
  node_const_B.connect(0, node_watch2, 0);
}

export function demo3(graph: LGraph) {
  graph.clear()
  var node_const_A = LiteGraph.createNode<ConstantNumber>("basic/number");
  node_const_A.pos = [200, 200];
  node_const_A.setValue(10);
  graph.add(node_const_A);

  var node_const_B = LiteGraph.createNode(ConstantNumber);
  node_const_B.pos = [200, 300];
  node_const_B.setValue(10);
  graph.add(node_const_B);

  var node_watch1 = LiteGraph.createNode("basic/watch");
  node_watch1.pos = [500, 200];
  graph.add(node_watch1);

  var node_watch2 = LiteGraph.createNode(Watch);
  node_watch2.pos = [500, 300];
  graph.add(node_watch2);

  var node_math = LiteGraph.createNode(MathOperation);
  node_math.pos = [500, 400];
  graph.add(node_math);

  var node_watch3 = LiteGraph.createNode(Watch);
  node_watch3.pos = [700, 400];
  graph.add(node_watch2);

  node_const_A.connect(0, node_math, 0);
  node_const_B.connect(0, node_math, 1);
  node_const_A.connect(0, node_watch1, 0);
  node_const_B.connect(0, node_watch2, 0);
  node_math.connect(0, node_watch3, 0);
}
