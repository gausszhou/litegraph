import LGraphNode from "../../core/LGraphNode";
/**
 * 逻辑非
 * @example in: true => out: false
 */
class LogicNot extends LGraphNode{
  static title = "NOT";
  static desc = "Return the logical negation";
  constructor() {
    super();
    this.properties = {};
    this.addInput("in", "boolean");
    this.addOutput("out", "boolean");
  }
  onExecute () {
    const result = !this.getInputData(0);
    this.setOutputData(0, result);
  };
}

export default LogicNot;
