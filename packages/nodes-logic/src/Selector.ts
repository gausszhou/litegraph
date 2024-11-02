import { BuiltInSlotType, LiteGraph } from "@gausszhou/litegraph-core";
import LGraphNode from "@gausszhou/litegraph-core/src/LGraphNode";

/**
 * 通道选择器
 * - 拥有一个通道选择端口，四个输入端口和一个输出端口
 * - 输入端口的值为 0-3
 * @example sel: 0  inputs: [3, 1, 4, 1] => out: 3
 */
class Selector extends LGraphNode {
  static title = "Selector";
  static desc = "selects an output";
  selected: number = 0;
  constructor() {
    super();
    this.addInput("sel", "number");
    this.addInput("A", "*"); // sel:0 -> index:1
    this.addInput("B", "*");
    this.addInput("C", "*");
    this.addInput("D", "*");
    this.addOutput("out", "*");
    this.selected = 0;
  }
  onDrawBackground  (ctx: CanvasRenderingContext2D) {
    if (this.flags.collapsed) {
      return;
    }
    ctx.fillStyle = "#AFB";
    const y = (this.selected + 1) * LiteGraph.NODE_SLOT_HEIGHT + 6;
    ctx.beginPath();
    ctx.moveTo(50, y);
    ctx.lineTo(50, y + LiteGraph.NODE_SLOT_HEIGHT);
    ctx.lineTo(34, y + LiteGraph.NODE_SLOT_HEIGHT * 0.5);
    ctx.fill();
  };
  onExecute() {
    let sel: number= this.getInputData(0);
    if (sel == null || typeof sel !== 'number') {
      sel = 0;
    }
    this.selected = sel = Math.round(sel) % (this.inputs.length - 1);
    // 将 sel 代表的输入端口的数据传输到输出端口
    const v:any = this.getInputData(sel + 1);
    if (v !== undefined) {
      this.setOutputData(0, v);
    }
  };
  onGetInputs () {
    return [
      ["E", 0],
      ["F", 0],
      ["G", 0],
      ["H", 0]
    ];
  };
}

export default Selector;