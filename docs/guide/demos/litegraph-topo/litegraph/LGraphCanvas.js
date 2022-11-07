import litegraph from "../dist/litegraph";
const { LGraphCanvas } = litegraph;
import LiteGraph from "./LiteGraph";

// 绘制子图面板
LGraphCanvas.prototype.drawSubgraphPanel = function (ctx) {
  var subgraph = this.graph;
  var subnode = subgraph._subgraph_node;
  if (!subnode) {
    console.warn("subgraph without subnode");
    return;
  }
  this.drawSubgraphPanelLeft(subgraph, subnode, ctx);
  this.drawSubgraphPanelRight(subgraph, subnode, ctx);
};

LGraphCanvas.prototype.drawSubgraphPanelLeft = function (subgraph, subnode, ctx) {
  var num = subnode.inputs ? subnode.inputs.length : 0;
  var w = 200;
  var h = Math.floor(LiteGraph.NODE_SLOT_HEIGHT * 1.6);

  ctx.fillStyle = "#111";
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.roundRect(10, 10, w, (num + 1) * h + 50, 8);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#888";
  ctx.font = "14px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Graph Inputs", 20, 34);
  // var pos = this.mouse;

  if (this.drawButton(w - 20, 20, 20, 20, "X", "#151515")) {
    this.closeSubgraph();
    return;
  }

  var y = 50;
  ctx.font = "14px Arial";
  if (subnode.inputs)
    for (var i = 0; i < subnode.inputs.length; ++i) {
      var input = subnode.inputs[i];
      if (input.not_subgraph_input) continue;

      //input button clicked
      if (this.drawButton(20, y + 2, w - 20, h - 2)) {
        var type = subnode.constructor.input_node_type || "graph/input";
        this.graph.beforeChange();
        var newnode = LiteGraph.createNode(type);
        if (newnode) {
          subgraph.add(newnode);
          this.block_click = false;
          this.last_click_position = null;
          this.selectNodes([newnode]);
          this.node_dragged = newnode;
          this.dragging_canvas = false;
          newnode.setProperty("name", input.name);
          newnode.setProperty("type", input.type);
          this.node_dragged.pos[0] = this.graph_mouse[0] - 5;
          this.node_dragged.pos[1] = this.graph_mouse[1] - 5;
          this.graph.afterChange();
        } else console.error("graph input node not found:", type);
      }
      ctx.fillStyle = "#9C9";
      ctx.beginPath();
      ctx.arc(w - 16, y + h * 0.5, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = "#AAA";
      ctx.fillText(input.name, 30, y + h * 0.75);
      // var tw = ctx.measureText(input.name);
      ctx.fillStyle = "#777";
      ctx.fillText(input.type, 130, y + h * 0.75);
      y += h;
    }
  //add + button
  if (this.drawButton(20, y + 2, w - 20, h - 2, "+", "#151515", "#222")) {
    this.showSubgraphPropertiesDialog(subnode);
  }
};

LGraphCanvas.prototype.drawSubgraphPanelRight = function (subgraph, subnode, ctx) {
  var num = subnode.outputs ? subnode.outputs.length : 0;
  var canvas_w = this.bgcanvas.width;
  var w = 200;
  var h = Math.floor(LiteGraph.NODE_SLOT_HEIGHT * 1.6);

  ctx.fillStyle = "#111";
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.roundRect(canvas_w - w - 10, 10, w, (num + 1) * h + 50, 8);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#888";
  ctx.font = "14px Arial";
  ctx.textAlign = "left";
  var title_text = "Graph Outputs";
  var tw = ctx.measureText(title_text).width;
  ctx.fillText(title_text, canvas_w - tw - 20, 34);
  // var pos = this.mouse;
  if (this.drawButton(canvas_w - w, 20, 20, 20, "X", "#151515")) {
    this.closeSubgraph();
    return;
  }

  var y = 50;
  ctx.font = "14px Arial";
  if (subnode.outputs)
    for (var i = 0; i < subnode.outputs.length; ++i) {
      var output = subnode.outputs[i];
      if (output.not_subgraph_input) continue;

      //output button clicked
      if (this.drawButton(canvas_w - w, y + 2, w - 20, h - 2)) {
        var type = subnode.constructor.output_node_type || "graph/output";
        this.graph.beforeChange();
        var newnode = LiteGraph.createNode(type);
        if (newnode) {
          subgraph.add(newnode);
          this.block_click = false;
          this.last_click_position = null;
          this.selectNodes([newnode]);
          this.node_dragged = newnode;
          this.dragging_canvas = false;
          newnode.setProperty("name", output.name);
          newnode.setProperty("type", output.type);
          this.node_dragged.pos[0] = this.graph_mouse[0] - 5;
          this.node_dragged.pos[1] = this.graph_mouse[1] - 5;
          this.graph.afterChange();
        } else console.error("graph input node not found:", type);
      }
      ctx.fillStyle = "#9C9";
      ctx.beginPath();
      ctx.arc(canvas_w - w + 16, y + h * 0.5, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = "#AAA";
      ctx.fillText(output.name, canvas_w - w + 30, y + h * 0.75);
      // var tw = ctx.measureText(input.name);
      ctx.fillStyle = "#777";
      ctx.fillText(output.type, canvas_w - w + 130, y + h * 0.75);
      y += h;
    }
  //add + button
  if (this.drawButton(canvas_w - w, y + 2, w - 20, h - 2, "+", "#151515", "#222")) {
    this.showSubgraphPropertiesDialogRight(subnode);
  }
};
// 重写子图属性 input
LGraphCanvas.prototype.showSubgraphPropertiesDialog = function (node) {
  // console.log("showing subgraph properties dialog");
  var that = this;
  // old_panel if old_panel is exist close it
  var old_panel = this.canvas.parentNode.querySelector(".subgraph_dialog");
  if (old_panel) old_panel.close();
  // new panel
  var panel = this.createPanel("Subgraph Inputs", {
    closable: true,
    width: 500
  });
  panel.node = node;
  panel.classList.add("subgraph_dialog");

  function inner_refresh() {
    panel.clear();
    //show currents
    if (node.inputs)
      for (var i = 0; i < node.inputs.length; ++i) {
        var input = node.inputs[i];
        if (input.not_subgraph_input) continue;
        var html =
          "<button>&#10005;</button> <span class='bullet_icon'></span><span class='name'></span><span class='type'></span>";
        var elem = panel.addHTML(html, "subgraph_property");
        elem.dataset["name"] = input.name;
        elem.dataset["slot"] = i;
        elem.querySelector(".name").innerText = input.name;
        elem.querySelector(".type").innerText = input.type;
        elem.querySelector("button").addEventListener("click", function (e) {
          node.removeInput(Number(this.parentNode.dataset["slot"]));
          inner_refresh();
        });
      }
  }

  var html =
    " + <span class='label'>Name</span><input class='name'/><span class='label'>Type</span><input class='type'><button>+</button>";
  var elem = panel.addHTML(html, "subgraph_property extra", true);
  elem.querySelector(".name").addEventListener("keydown", function (e) {
    if (e.keyCode == 13) {
      addInput.apply(this);
    }
  });
  elem.querySelector("button").addEventListener("click", function (e) {
    addInput.apply(this);
  });
  function addInput() {
    var elem = this.parentNode;
    var name = elem.querySelector(".name").value;
    var type = elem.querySelector(".type").value;
    if (!name || node.findInputSlot(name) != -1) return;
    node.addInput(name, type);
    elem.querySelector(".name").value = "";
    elem.querySelector(".type").value = "";
    inner_refresh();
  }

  inner_refresh();
  this.canvas.parentNode.appendChild(panel);
  return panel;
};

//  output
LGraphCanvas.prototype.showSubgraphPropertiesDialogRight = function (node) {
  // console.log("showing subgraph properties dialog");
  var that = this;
  // old_panel if old_panel is exist close it
  var old_panel = this.canvas.parentNode.querySelector(".subgraph_dialog");
  if (old_panel) old_panel.close();
  // new panel
  var panel = this.createPanel("Subgraph Outputs", {
    closable: true,
    width: 500
  });
  panel.node = node;
  panel.classList.add("subgraph_dialog");

  function inner_refresh() {
    panel.clear();
    //show currents
    if (node.outputs)
      for (var i = 0; i < node.outputs.length; ++i) {
        var input = node.outputs[i];
        if (input.not_subgraph_output) continue;
        var html =
          "<button>&#10005;</button> <span class='bullet_icon'></span><span class='name'></span><span class='type'></span>";
        var elem = panel.addHTML(html, "subgraph_property");
        elem.dataset["name"] = input.name;
        elem.dataset["slot"] = i;
        elem.querySelector(".name").innerText = input.name;
        elem.querySelector(".type").innerText = input.type;
        elem.querySelector("button").addEventListener("click", function (e) {
          node.removeOutput(Number(this.parentNode.dataset["slot"]));
          inner_refresh();
        });
      }
  }

  //add extra
  var html =
    " + <span class='label'>Name</span><input class='name'/><span class='label'>Type</span><input class='type'></input><button>+</button>";
  var elem = panel.addHTML(html, "subgraph_property extra", true);
  elem.querySelector(".name").addEventListener("keydown", function (e) {
    if (e.keyCode == 13) {
      addOutput.apply(this);
    }
  });
  elem.querySelector("button").addEventListener("click", function (e) {
    addOutput.apply(this);
  });
  function addOutput() {
    var elem = this.parentNode;
    var name = elem.querySelector(".name").value;
    var type = elem.querySelector(".type").value;
    if (!name || node.findOutputSlot(name) != -1) return;
    node.addOutput(name, type);
    elem.querySelector(".name").value = "";
    elem.querySelector(".type").value = "";
    inner_refresh();
  }

  inner_refresh();
  this.canvas.parentNode.appendChild(panel);
  return panel;
};

// 重写NodePanel
LGraphCanvas.prototype.showShowNodePanel = function (node) {
  return false;
};

// 重写closeGraph
LGraphCanvas.prototype.closeSubgraph = function () {
  if (!this._graph_stack || this._graph_stack.length == 0) {
    return;
  }
  var subgraph_node = this.graph._subgraph_node;
  var graph = this._graph_stack.pop();
  this.selected_nodes = {};
  this.highlighted_links = {};
  graph.attachCanvas(this);
  this.setDirty(true, true);
  if (subgraph_node) {
    this.centerOnNode(subgraph_node);
    this.selectNodes([subgraph_node]);
  }
  // when close sub graph back to offset [0, 0] scale 1
  this.ds.offset = [0, 0];
  this.ds.scale = 1;
};

// Group 右键菜单
LGraphCanvas.prototype.getGroupMenuOptions = function (node) {
  var o = [
    { content: "Title", callback: LGraphCanvas.onShowPropertyEditor },
    {
      content: "Color",
      has_submenu: true,
      callback: LGraphCanvas.onMenuNodeColors
    },
    null,
    { content: "Remove", callback: LGraphCanvas.onMenuNodeRemove }
  ];
  return o;
};

export default LGraphCanvas;
