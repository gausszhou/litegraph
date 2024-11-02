import { type SlotLayout, type Vector2 } from "@gausszhou/litegraph-core";
import LGraphNode from "@gausszhou/litegraph-core/src/LGraphNode";

export default class MathFloor extends LGraphNode {
    static slotLayout: SlotLayout = {
        inputs: [
            { name: "in", type: "number" },
        ],
        outputs: [
            { name: "out", type: "number" },
        ],
    }

    override size: Vector2 = [80, 30];

    override onExecute() {
        var v = this.getInputData(0);
        if (v == null) {
            return;
        }
        this.setOutputData(0, Math.floor(v));
    };
}
