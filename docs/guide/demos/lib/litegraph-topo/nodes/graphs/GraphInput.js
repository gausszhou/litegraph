import LiteGraph from "../../litegraph/LiteGraph";
import Graph from "./Graph";

//Input for a subgraph
function GraphInput() {
  this.addOutput("Default", "");
  this.name_in_graph = "";
  this.properties = {
    name: "Default",
    type: "Any"
  };

  var that = this;
  this.name_widget = this.addWidget(
    "text",
    "Name",
    that.properties.name,
    "name"
  );
  this.widgets_up = true;
  this.size = [180, 28];
}

GraphInput.title = "Input";
GraphInput.desc = "Input of the graph";
GraphInput.registerType = "graph/input";
GraphInput.filter = "is_dontshow";

GraphInput.prototype = Object.create(Graph.prototype);
GraphInput.prototype.constructor = GraphInput;

GraphInput.prototype.onConfigure = function () {
  this.updateType();
};

//this is executed AFTER the property has changed
GraphInput.prototype.onPropertyChanged = function (name, v) {
  if (name == "name") {
    if (v == "" || v == this.name_in_graph || v == "enabled") {
      return false;
    }
    if (this.graph) {
      if (this.name_in_graph) {
        //already added
        this.graph.renameInput(this.name_in_graph, v);
      } else {
        this.graph.addInput(v, this.properties.type);
      }
    } //what if not?!
    this.name_widget.value = v;
    this.name_in_graph = v;
  } else if (name == "type") {
    this.updateType();
  } else if (name == "value") {
  }
};

//ensures the type in the node output and the type in the associated graph input are the same
GraphInput.prototype.updateType = function () {
  var type = this.properties.type;
  if (this.type_widget) this.type_widget.value = type;

  //update output
  if (this.outputs[0].type != type) {
    if (!LiteGraph.isValidConnection(this.outputs[0].type, type))
      this.disconnectOutput(0);
    this.outputs[0].type = type;
  }

  //update graph
  if (this.graph && this.name_in_graph) {
    this.graph.changeInputType(this.name_in_graph, type);
  }
};

GraphInput.prototype.onAction = function (action, param) {
  if (this.properties.type == LiteGraph.EVENT) {
    this.triggerSlot(0, param);
  }
};

GraphInput.prototype.onExecute = function () {
  var name = this.properties.name;
  var data = this.graph.inputs[name];
  if (!data) {
    this.setOutputData(0, this.properties.value);
    return;
  }
  this.setOutputData(
    0,
    data.value !== undefined ? data.value : this.properties.value
  );
};

GraphInput.prototype.getTitle = function () {
  if (this.flags.collapsed) {
    return this.properties.name;
  }
  return this.title;
};

// GraphInput.prototype.onRemoved = function () {
//   if (this.name_in_graph) {
//     this.graph.removeInput(this.name_in_graph);
//   }
// };

export default GraphInput;
