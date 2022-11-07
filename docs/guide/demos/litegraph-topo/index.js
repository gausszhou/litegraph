import LiteGraph from "./litegraph/LiteGraph";
import LGraph from "./litegraph/LGraph";
import LGraphNode from "./litegraph/LGraphNode";
import LGraphGroup from "./litegraph/LGraphGroup";
import LGraphCanvas from "./litegraph/LGraphCanvas";
import ContextMenu from "./litegraph/ContextMenu";

/*
LiteGraph
LGraph: the container of a whole graph made of nodes
LGraphNode: the base class of a node (this library uses is own system of inheritance)
LGraphCanvas: the class in charge of rendering/interaction with the nodes inside the browser.
*/

// 自定义子图
import Subgraph from "./nodes/graphs/Subgraph";
import GraphInput from "./nodes/graphs/GraphInput";
import GraphOutput from "./nodes/graphs/GraphOutput";

import Acc from "./nodes/circuits/Acc";
import Add from "./nodes/circuits/Add";
import Decoder from "./nodes/circuits/Decoder";
import And from "./nodes/circuits/And";
import Or from "./nodes/circuits/Or";
import Not from "./nodes/circuits/Not";
import ToBool from "./nodes/circuits/ToBool";
import Oscillator from "./nodes/circuits/Oscillator";
import LED from "./nodes/circuits/LED";

// LiteGraph.clearRegisteredTypes()
// 注册节点
const registerList = [
  Subgraph,
  GraphInput,
  GraphOutput,
  And,
  Not,
  Or,
  ToBool,
  Decoder,
  Oscillator,
  Acc,
  Add,
  LED
];
registerList.forEach((device) => {
  LiteGraph.registerNodeType(device.registerType, device);
});

// Vue 请在mounted钩子之后使用此方法new一个topo实例
// React 同理，请在能获取到DOM之后，调用方法，传入选择器和节点数据
function Topo(selector, options) {
  this.graph = new LGraph();
  console.log("graph created");
  this.canvas = new LGraphCanvas(selector, this.graph, options);
  console.log("canvas created");
  // 创建后 this.graph 执行顶层graph
  // 创建后 this.canvas.graph 指向当前graph或者subgraph
}

//  绑定静态属性
Topo.LiteGraph = LiteGraph; // 库的根对象
Topo.LGraph = LGraph; // 由节点制成的整个图形的容器
Topo.LGraphGroup = LGraphGroup; // Group
Topo.LGraphNode = LGraphNode; // 节点的基类
Topo.LGraphCanvas = LGraphCanvas; // 与浏览器中的节点的呈现/交互的类
Topo.ContextMenu = ContextMenu;

// 接口：清除已经注册的节点
Topo.clearRegisteredTypes = function () {
  Topo.LiteGraph.clearRegisteredTypes();
};

// 接口：注册节点
Topo.registerNodeType = function (type, node) {
  Topo.LiteGraph.registerNodeType(type, node);
};

// 定义原型方法

Topo.prototype.init = function (selector) {
  // do some thing
};

// 从侧边栏添加节点 需要重写id
Topo.prototype.addNode = function (node) {
  let new_node = Topo.LiteGraph.createNode(node.type);
  // 设置
  new_node.title = node.title;
  new_node.pos = node.pos;
  // 重写id
  new_node.id = node.uuid || node.id;
  // 绑定uuid
  new_node.uuid = node.uuid || node.id;
  // 创建userData
  new_node.userData = {};
  this.canvas.graph.add(new_node);
  return new_node;
};

// 添加容器
Topo.prototype.addContainer = function (node) {
  let new_container = Topo.LiteGraph.createNode(node.type);
  this.canvas.graph.add(new_container);
};

// 删除节点
Topo.prototype.removeNode = function (node) {
  this.canvas.graph.remove(node);
};

// 序列化 导出数据
Topo.prototype.serialize = function (data) {
  return this.graph.serialize(data);
};

// 导入数据
Topo.prototype.configure = function (data) {
  this.graph.configure(data);
};

export default Topo;
