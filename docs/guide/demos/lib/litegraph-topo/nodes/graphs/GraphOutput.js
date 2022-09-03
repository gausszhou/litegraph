import LiteGraph from "../../litegraph/LiteGraph";
import Graph from "./Graph";

//Output for a subgraph
function GraphOutput() {
  this.addInput("Default", "");
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

GraphOutput.title = "Output";
GraphOutput.desc = "Output of the graph";
GraphOutput.registerType = "graph/output";
GraphOutput.filter = "is_dontshow";

GraphOutput.prototype = Object.create(Graph.prototype);
GraphOutput.prototype.constructor = GraphOutput;

GraphOutput.prototype.onPropertyChanged = function (name, v) {
  if (name == "name") {
    if (v == "" || v == this.name_in_graph || v == "enabled") {
      return false;
    }
    if (this.graph) {
      if (this.name_in_graph) {
        //already added
        this.graph.renameOutput(this.name_in_graph, v);
      } else {
        this.graph.addOutput(v, this.properties.type);
      }
    } //what if not?!
    this.name_widget.value = v;
    this.name_in_graph = v;
  } else if (name == "type") {
    this.updateType();
  } else if (name == "value") {
  }
};

GraphOutput.prototype.updateType = function () {
  var type = this.properties.type;
  if (this.type_widget) this.type_widget.value = type;

  //update output
  if (this.inputs[0].type != type) {
    if (!LiteGraph.isValidConnection(this.inputs[0].type, type))
      this.disconnectInput(0);
    this.inputs[0].type = type;
  }

  //update graph
  if (this.graph && this.name_in_graph) {
    this.graph.changeOutputType(this.name_in_graph, type);
  }
};

GraphOutput.prototype.onAction = function (action, param) {
  if (this.properties.type == LiteGraph.ACTION) {
    this.graph.trigger(this.properties.name, param);
  }
};

GraphOutput.prototype.onExecute = function () {
  this._value = this.getInputData(0);
  this.graph.setOutputData(this.properties.name, this._value);
  // this.setOutputData(this.properties.name, this._value);
};

GraphOutput.prototype.getTitle = function () {
  if (this.flags.collapsed) {
    return this.properties.name;
  }
  return this.title;
};

// GraphOutput.prototype.onRemoved = function () {
//   if (this.name_in_graph) {
//     this.graph.removeOutput(this.name_in_graph);
//   }
// };

export default GraphOutput;
