import { SlotLayout } from "@gausszhou/litegraph-core";

declare class LGraphNode {
    constructor(title: string)
    title
    flags
    graph
    size
    properties
    boxcolor
    widgets_up
    inputs
    outputs
    isInputConnected(...args: any)
    trigger(...args: any)
    triggerSlot(...args: any)
    addWidget(...args: any)
    getTitle()
    disconnectOutput(slot: number);
    setProperty(...args: any)
    getInputData(slot: number);
    setOutputData(slot: number, value: any);
    onPropertyChanged(name: string, value: any);
    onExecute(...args: any)
    onAction(...args: any)
    onDrawBackground(ctx: CanvasRenderingContext2D);
    onDropFile(file: File)
    onConnectionsChange(...args: any)
}

export default class StringToUpperCase extends LGraphNode {
    static slotLayout: SlotLayout = {
        inputs: [
            { name: "in", type: "string" },
        ],
        outputs: [
            { name: "out", type: "string" },
        ],
    }

    override onExecute() {
        const a = this.getInputData(0)
        let b = a;
        if (a != null && a.constructor === String) {
            b = a.toUpperCase();
        }
        this.setOutputData(0, b)
    };
}
