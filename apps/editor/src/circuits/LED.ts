import { LGraphNode } from "@gausszhou/litegraph-core";


export default class LED  extends LGraphNode {
  static shape = 1;
  static title = "LED";
  static desc  = "LED"
  static title_color = "#012";
  static registerType = "circuit/led";
  static filter = "is_filter";
  value: boolean;

  constructor() {
    super();
    this.addInput("level", "Boolean");
    this.value = false;
  }

  onExecute() {
    let flag = this.getInputData(0);
    this.value = flag;
  }

  onDrawBackground(ctx, area) {
    if (this.flags.collapsed) return;
    ctx.save();
    ctx.fillStyle = this.value ? "#fff" : "#000";
    ctx.fillRect(0, 0, this.size[0], this.size[1]);
    ctx.restore();
  }
}
