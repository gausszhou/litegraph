# What is LiteGraph?

## 摘要

LiteGraph 是一个 JavaScript 库，用于在类似于 Unreal Blueprints 虚幻蓝图的浏览器中创建图形。

它可以轻松编程节点，它包括要构造和测试图形的编辑器。

它可以在任何现有的 Web 应用程序中轻松集成，并且可以在不需要编辑器的情况下运行图形。

这里有一个[Demo](https://tamats.com/projects/litegraph/editor)供您尝试。

LiteGraph 开源在 Github 上，这是它的[Github 仓库地址](https://github.com/jagenjo/litegraph.js)

## 特性

- 在 Canvas2D 上渲染（放大/缩小和平移，易于渲染复杂的界面，可以在 WebGLTexture 中使用）
- 易于使用的编辑器（搜索框、键盘快捷键、多选、上下文菜单等）
- 优化为每个图支持数百个节点（在编辑器上和执行上）
- 可定制的主题（颜色、形状、背景）
- 回调以个性化节点的每个动作/绘图/事件
- 子图（包含图本身的节点）
- 实时模式系统（隐藏图形但调用节点以呈现它们想要的任何内容，有助于创建 UI）
- 图形可以在 NodeJS 中执行
- 高度可定制的节点（颜色、形状、垂直或水平插槽、小部件、自定义渲染）
- 易于集成到任何 JS 应用程序中（单个文件，无依赖关系）
- 支持 Typescript

## 内置节点

尽管创建新节点类型很容易，但 LiteGraph 附带了一些默认节点，这些节点在许多情况下都很有用：

- 界面（小部件）
- 数学（三角学、数学运算）
- 音频（AudioAPI 和 MIDI）
- 3D 图形（WebGL 中的后处理）
- 输入（读取游戏手柄）

## 安装

你可以使用 npm 安装它

```bash
npm install litegraph.js
```

或者从这个存储库下载 `build/litegraph.js` 和 `css/litegraph.css` 版本。

## 第一个项目

```html
<html>
  <head>
    <link rel="stylesheet" type="text/css" href="litegraph.css" />
    <script type="text/javascript" src="litegraph.js"></script>
  </head>
  <body style="width:100%; height:100%">
    <canvas id="mycanvas" width="1024" height="720" style="border: 1px solid"></canvas>
    <script>
      // new 一个Graph对象，保存图形描述数据
      var graph = new LGraph();
      // 将Graph和Canvas画布进行绑定
      var canvas = new LGraphCanvas("#mycanvas", graph);

      // node basic/const
      var node_const = LiteGraph.createNode("basic/const");
      node_const.pos = [200, 200];
      graph.add(node_const);
      node_const.setValue(4.5);
      // node basic/watch
      var node_watch = LiteGraph.createNode("basic/watch");
      node_watch.pos = [700, 200];
      graph.add(node_watch);

      // 通用方法 连接 source_node.connect(source_slot,target_node,target_slot)
      node_const.connect(0, node_watch, 0);
      graph.start();
    </script>
  </body>
</html>
```

## 创建一个节点类

以下是如何构建一个将两个输入相加的节点的示例：

```js
// node constructor class
// 1.构造一个节点类
function MyAddNode() {
  this.addInput("A", "number");
  this.addInput("B", "number");
  this.addOutput("A+B", "number");
  this.properties = { precision: 1 };
}

//name to show
// 2.设置节点类的属性，可以被示例属性重写
MyAddNode.title = "Sum";

//function to call when the node is executed
// 3.配置，执行节点时调用的函数
MyAddNode.prototype.onExecute = function () {
  var A = this.getInputData(0);
  if (A === undefined) A = 0;
  var B = this.getInputData(1);
  if (B === undefined) B = 0;
  this.setOutputData(0, A + B);
};

// register in the system
// 4.注册节点
LiteGraph.registerNodeType("basic/sum", MyAddNode);
```

或者你可以包装一个现有的函数：

```js
function sum(a, b) {
  return a + b;
}
// 直接将一个函数作为节点
LiteGraph.wrapFunctionAsNode("math/sum", sum, ["Number", "Number"], "Number");
```

## 服务端

它也可以使用 NodeJS 在服务器端工作，尽管有些节点在服务器（音频、图形、输入等）中不起作用。

```js
var LiteGraph = require("./litegraph.js").LiteGraph;

var graph = new LiteGraph.LGraph();

var node_time = LiteGraph.createNode("basic/time");
graph.add(node_time);

var node_console = LiteGraph.createNode("basic/console");
node_console.mode = LiteGraph.ALWAYS;
graph.add(node_console);

node_time.connect(0, node_console, 1);

graph.start();
```

## 在线演示

该演示包括一些图形示例。 为了试用它们，您可以访问 [演示站点](http://tamats.com/projects/litegraph/editor)

或者将其安装在您的本地计算机上，为此您需要 `git`、`node` 和 `npm `. 鉴于已安装这些依赖项，请运行以下命令进行试用：

```sh
$ git clone https://github.com/jagenjo/litegraph.js.git
$ cd litegraph.js
$ npm install
$ node utils/server.js
Example app listening on port 80!
```

打开浏览器并将其指向 http://localhost:8000/ 。 您可以从页面顶部的下拉列表中选择一个演示。




