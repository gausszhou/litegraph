import LGraphNode from "../../core/LGraphNode";

/**
 * 逻辑或
 * @example a: true b: false => out: true
 */
class LogicOr extends LGraphNode {
  static title = "OR";
  static desc = "Return true if at least one input is true";
  constructor() {
    super();
    this.properties = {};
    this.addInput("a", "boolean");
    this.addInput("b", "boolean");
    this.addOutput("out", "boolean");
  }
  onExecute() {
    let result = false;
    this.inputs.forEach((input, index) => {
      if (this.getInputData(index)) {
        result = true;
      }
    })
    this.setOutputData(0, result);
  };

  onGetInputs() {
    return [["or", "boolean"]];
  };
}





export default LogicOr