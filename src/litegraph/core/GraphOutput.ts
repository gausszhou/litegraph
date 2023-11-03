import LiteGraph from ".";
import LGraphNode from "./LGraphNode";

/**
 * Output for a subgraph
 */

class GraphOutput extends LGraphNode {
  static title = "Output";
  static desc = "Output of the graph";
  static install(LiteGraph: LiteGraph){
    LiteGraph.GraphOutput = GraphOutput;
    LiteGraph.registerNodeType("graph/output", GraphOutput);
  }
  name_in_graph = "";
  properties = { name: "", type: "" };
  name_widget:any ;
  type_widget:any ;
  widgets_up = true;
  size = [180, 60];  
  
  private _value:any = ""
  constructor(){
    super("Output");
    this.addInput("", "");
    this.name_widget = this.addWidget("text", "Name", this.properties.name, "name");
    this.type_widget = this.addWidget("text", "Type", this.properties.type, "type");
  }

  onPropertyChanged(name: string, v: any){
    if (name == "name") {
      if (v == "" || v == this.name_in_graph || v == "enabled") {
        return false;
      }
      if (this.graph) {
        if (this.name_in_graph) {
          // already added
          this.graph.renameOutput(this.name_in_graph, v);
        } else {
          this.graph.addOutput(v, this.properties.type);
        }
      } // what if not?!
      this.name_widget.value = v;
      this.name_in_graph = v;
    } else if (name == "type") {
      this.updateType();
    } else if (name == "value") {

    }
    return true;
  }
  updateType () {
    let type = this.properties.type;
    if (this.type_widget) {
      this.type_widget.value = type;
    }

    // update output
    if (this.inputs[0].type != type) {
      if (type == "action" || type == "event") {
        type = LiteGraph.EVENT;
      }
      if (!LiteGraph.isValidConnection(this.inputs[0].type, type)) this.disconnectInput(0);
      this.inputs[0].type = type;
    }

    // update graph
    if (this.graph && this.name_in_graph) {
      this.graph.changeOutputType(this.name_in_graph, type);
    }
  };

  onExecute  () {
    this._value = this.getInputData(0);
    this.graph!.setOutputData(this.properties.name, this._value);
  };

  onAction<T>(action: string, param: T) {
    if (this.properties.type == LiteGraph.ACTION) {
      this.graph!.trigger(this.properties.name, param);
    }
  };

  onRemoved  () {
    if (this.name_in_graph) {
      this.graph!.removeOutput(this.name_in_graph);
    }
  };

  getTitle  () {
    if (this.flags.collapsed) {
      return this.properties.name;
    }
    return this.title;
  };
}

export default GraphOutput