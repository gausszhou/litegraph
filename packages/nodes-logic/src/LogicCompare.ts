import { BuiltInSlotType } from "@gausszhou/litegraph-core";
import LGraphNode from "@gausszhou/litegraph-core/src/LGraphNode";


class LogicCompare extends LGraphNode {
  static title = "Compare";
  static desc = "Compare for logical equality";

  constructor() {
    super();
    this.properties = {};
    this.addInput("a", "boolean");
    this.addInput("b", "boolean");
    this.addOutput("out", "boolean");
  }

  onExecute() {
    const result = this.getInputData(0) === this.getInputData(1)
    this.setOutputData(0, result);
  };

  onGetInputs() {
    return [["bool", "boolean"]];
  };

}

export default LogicCompare;
