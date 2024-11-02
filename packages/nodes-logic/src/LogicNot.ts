import  { SlotLayout }  from "@gausszhou/litegraph-core/src/LGraphNode";
declare class LGraphNode {
    flags
    size
    properties
    getTitle()
    onPropertyChanged(name: string, value: any);
    onExecute()
    getInputData(slot: number);
    setOutputData(slot: number, value: any);
    onDrawBackground(ctx: CanvasRenderingContext2D);
}
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
