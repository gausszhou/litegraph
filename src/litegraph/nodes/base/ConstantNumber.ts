import LGraphNode from "../../core/LGraphNode";

class ConstantNumber extends LGraphNode {
  static title = "Const Number";
  static desc = "Constant number";
  widget
  widgets_up = true;
  constructor() {
    super()
    this.addOutput("value", "number");
    this.addProperty("value", 1.0, "string");
    this.widget = this.addWidget("number", "value", 1, "value");
    this.widgets_up = true;
    this.size = [180, 30];
  }
  
  getTitle() {
    if (this.flags.collapsed) {
      return this.properties.value;
    }
    return this.title;
  };

  setValue(v: string | number) {
    this.setProperty("value", v);
  };

  onExecute () {
    this.setOutputData(0, parseFloat(this.properties["value"]));
  };

  onDrawBackground() {
    // show the current value in label
    this.outputs[0].label = this.properties["value"].toFixed(3);
  };
  
}

export default ConstantNumber;




  