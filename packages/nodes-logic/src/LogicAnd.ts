import type { SlotLayout }  from "@gausszhou/litegraph-core";

declare class LGraphNode {
    flags
    inputs
    size
    properties
    getTitle()
    onPropertyChanged(name: string, value: any);
    onExecute()
    getInputData(slot: number);
    setOutputData(slot: number, value: any);
    onDrawBackground(ctx: CanvasRenderingContext2D);
}

export default class LogicAnd extends LGraphNode{
    static slotLayout: SlotLayout = {
        inputs: [
            { name: "a", type: "boolean" },
            { name: "b", type: "boolean" },
        ],
        outputs: [
            { name: "out", type: "boolean" },
        ],
    }

    override onExecute() {
        let ret = true;
        for (let inX = 0; inX < this.inputs.length; inX++) {
            if (!this.getInputData(inX)) {
                ret = false;
                break;
            }
        }
        this.setOutputData(0, ret);
    };
}

