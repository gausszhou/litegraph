import LiteGraph from "../../core/LiteGraph";
import LGraphNode from "../../core/LGraphNode";

/**
 * 逻辑分支
 * 通过切换 condition 端口的值，触发名为 true 或 false 的输出端口
 * @example condition: true => trigger: true
 */
class LogicBranch extends LGraphNode{
  static title = "Branch";
  static desc = "Branch execution on condition";
  constructor() {
    super()
    this.properties = {};
    this.addInput("onTrigger", LiteGraph.ACTION);
    this.addInput("condition", "boolean");
    this.addOutput("true", LiteGraph.EVENT);
    this.addOutput("false", LiteGraph.EVENT);
    this.mode = LiteGraph.ON_TRIGGER;
  }
  onExecute() {
    const condtition = this.getInputData(1);
    if (condtition) {
      this.triggerSlot(0);
    } else {
      this.triggerSlot(1);
    }
  };
}

export default LogicBranch;