import LiteGraph from '.';
import LGraphNode from './LGraphNode';

/**
 * Input for a subgraph
 */

class GraphInput extends LGraphNode {
  static title = "Input";
  static desc = "Input of the graph";
  static install(LiteGraph: LiteGraph){
    LiteGraph.GraphInput = GraphInput;
    LiteGraph.registerNodeType("graph/input", GraphInput);
  }
  name_in_graph = "";
  properties = {
    name: "Number",
    type: "number",
    value: 0
  };
  widgets_up = true;
  name_widget: any = null;
  type_widget: any = null;
  value_widget: any = null;
  constructor() {
    super("");
    this.addOutput("", "number", 0);
    this.name_widget = this.addWidget("text", "Name", this.properties.name, (v:string) => {
      this.setProperty("name", v);
    });
    this.type_widget = this.addWidget("text", "Type", this.properties.type, (v: string) => {
      this.setProperty("type", v);
    });
    this.value_widget = this.addWidget("number", "Value", this.properties.value, (v: number) => {
      this.setProperty("value", v);
    });

    this.widgets_up = true;
    this.size = [180, 90];
  }
  onConfigure() {
    this.updateType();
  };
  //ensures the type in the node output and the type in the associated graph input are the same
  updateType() {
    const type = this.properties.type;
    this.type_widget.value = type;

    // update output
    if (this.outputs[0].type != type) {
      if (!LiteGraph.isValidConnection(this.outputs[0].type, type)) {
        this.disconnectOutput(0);
      }
      this.outputs[0].type = type;
    }

    //update widget
    if (type == "number") {
      this.value_widget.type = "number";
      this.value_widget.value = 0;
    } else if (type == "boolean") {
      this.value_widget.type = "toggle";
      this.value_widget.value = true;
    } else if (type == "string") {
      this.value_widget.type = "text";
      this.value_widget.value = "";
    } else {
      this.value_widget.type = null;
      this.value_widget.value = null;
    }
    this.properties.value = this.value_widget.value;

    //update graph
    if (this.graph && this.name_in_graph) {
      this.graph.changeInputType(this.name_in_graph, type);
    }
  };

  // this is executed AFTER the property has changed
  onPropertyChanged(name: string, v:any) {
    if (name == "name") {
      if (v == "" || v == this.name_in_graph || v == "enabled") {
        return false;
      }
      if (this.graph) {
        if (this.name_in_graph) {
          // already added
          this.graph.renameInput(this.name_in_graph, v);
        } else {
          this.graph.addInput(v, this.properties.type);
        }
      } 
      this.name_widget.value = v;
      this.name_in_graph = v;
    } else if (name == "type") {
      this.updateType();
    } else if (name == "value") {

    }
    return true;
  };

  getTitle() {
    if (this.flags.collapsed) {
      return this.properties.name;
    }
    return this.title;
  };

  onAction<T>(action: string, param: T) {
    // 接收事件触发参数
    if (this.properties.type == LiteGraph.EVENT) {
      this.triggerSlot(0, param);
    }
  };

  onExecute() {
    var name = this.properties.name;
    //read from global input
    var data = this.graph!.inputs[name];
    if (!data) {
      this.setOutputData(0, this.properties.value);
      return;
    }

    this.setOutputData(0, data.value !== undefined ? data.value : this.properties.value);
  };

  onRemoved() {
    if (this.name_in_graph) {
      this.graph!.removeInput(this.name_in_graph);
    }
  };

}

export default GraphInput;