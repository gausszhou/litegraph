# LiteGraph Class

我们对 LiteGraph 进行封装，使其方便用于我们的业务，这里称之为`litegraph-topo`，基于 WebPack 环境打包构建

## 目录结构

> 小贴士 使用`npm install treer -g `，然后使用`treer`命令可以生成目录结构，我一般使用`treer > tree.txt`将其保存到某个文本文件

```bash
├─litegraph-topo
|       ├─index.js # 入口文件
|       ├─styles   # 样式也做一点定制修改
|       |   ├─index.scss
|       |   ├─litegraph-custom.scss
|       |   ├─litegraph-editor.scss
|       |   └litegraph.scss
|       ├─nodes # 由于原有版本0.7.9的子图存在bug，这里也做一次二次封装，修复其问题
|       |   ├─graphs
|       |   |   ├─Graph.js
|       |   |   ├─GraphInput.js
|       |   |   ├─GraphOutput.js
|       |   |   └Subgraph.js
|       ├─litegraph  # litegraph 每个类单独引入，封装，导出
|       |     ├─ContextMenu.js
|       |     ├─LGraph.js
|       |     ├─LGraphCanvas.js
|       |     ├─LGraphGroup.js
|       |     ├─LGraphNode.js
|       |     └LiteGraph.js
```

## 入口文件

接口

- 提供实例创建
- 提供数据导入
- 提供数据导出

---

```js
import LiteGraph from "./litegraph/LiteGraph";
import LGraph from "./litegraph/LGraph";
import LGraphNode from "./litegraph/LGraphNode";
import LGraphGroup from "./litegraph/LGraphGroup";
import LGraphCanvas from "./litegraph/LGraphCanvas";
import ContextMenu from "./litegraph/ContextMenu";
// 自定义子图节点
import Subgraph from "./nodes/graphs/Subgraph";
import GraphInput from "./nodes/graphs/GraphInput";
import GraphOutput from "./nodes/graphs/GraphOutput";
// 清空所有默认节点，统统不需要
LiteGraph.clearRegisteredTypes();
// 注册节点
const registerList = [Subgraph, GraphInput, GraphOutput];
registerList.forEach((device) => {
  LiteGraph.registerNodeType(device.registerType, device);
});
```

```js
// Vue 请在mounted钩子之后使用此方法new一个topo实例
// React 同理，请在能获取到DOM之后，调用方法，传入选择器和节点数据
function Topo(selector, options) {
  this.graph = new LGraph();
  console.log("graph created");
  this.canvas = new LGraphCanvas(selector, this.graph, options);
  console.log("canvas created");
  // 创建后 this.graph 执行顶层graph
  // 创建后 this.canvas.graph 指向当前graph或者subgraph
  this.graph.filter = "is_filter";
  // 定义节点过滤
  // this.canvas.filter = "showtomenu"
}
```

```js
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
```

```js
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
```

```js
export default Topo;
```
