import LiteGraph from "../../core";
import LGraphNode from "../../core/LGraphNode";


class ConstantBoolean extends LGraphNode {
  static title = "Const Boolean";
  static desc = "Constant boolean";
  properties = {
    value: true
  }
  widget
  widgets_up
  constructor() {
    super()
    this.addOutput("bool", "boolean");
    this.addProperty("value", true, "boolean");
    this.widget = this.addWidget("toggle", "value", true, "value");
    this.serialize_widgets = true;
    this.widgets_up = true;
    this.size = [140, 30];
  }
  getTitle() {
    if (this.flags.collapsed) {
      return String(this.properties.value);
    }
    return this.title;
  };

  setValue(v: boolean) {
    this.setProperty("value", v);
  };

  onExecute() {
    this.setOutputData(0, this.properties.value);
  };

  // toggle value
  onAction() {
    this.setValue(!this.properties.value);
  };

  onGetInputs  () {
    return [["toggle", LiteGraph.ACTION]];
  };
}

export default ConstantBoolean;
