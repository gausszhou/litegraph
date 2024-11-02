import  { SlotLayout }  from "@gausszhou/litegraph-core/src/LGraphNode";
import LGraphNode from "@gausszhou/litegraph-core/src/LGraphNode";
export default class LogicNot extends LGraphNode {
    static slotLayout: SlotLayout = {
        inputs: [
            { name: "in", type: "boolean" },
        ],
        outputs: [
            { name: "out", type: "boolean" },
        ],
    }

    override onExecute() {
        var ret = !this.getInputData(0);
        this.setOutputData(0, ret);
    };
}
