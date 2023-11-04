import LGraphNode from "../../core/LGraphNode";

/**
 * 逻辑且
 * @example a: true b: false => out: false
 */
class LogicAnd extends LGraphNode {
  static title = "AND";
  static desc = "Return true if all inputs are true";
  constructor() {
    super()
    this.properties = {};
    this.addInput("a", "boolean");
    this.addInput("b", "boolean");
    this.addOutput("out", "boolean");
  }

  onExecute() {
    let result = true;
    this.inputs.forEach((input, index) => {      
      if(!this.getInputData(index)) {
        result = false;
      }
    })
    this.setOutputData(0, result);
  };
  onGetInputs() {
    return [["and", "boolean"]];
  };
}

export default LogicAnd;