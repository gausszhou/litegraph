import LGraphNode from "../../core/LGraphNode";

class Time extends LGraphNode {
  static title = "Time";
  static desc = "Time";
  constructor() {
    super();
    this.addOutput("in ms", "number");
    this.addOutput("in sec", "number");
  }
  onExecute() {
    this.setOutputData(0, this.graph!.globaltime * 1000);
    this.setOutputData(1, this.graph!.globaltime);
  };
}

export default Time;