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

export default class StringCompare extends LGraphNode {
    static slotLayout: SlotLayout = {
        inputs: [
            { name: "A", type: "string" },
            { name: "B", type: "string" },
        ],
        outputs: [
            { name: "==", type: "boolean" },
        ],
    }

    override onExecute() {
        const value = this.getInputData(0) == this.getInputData(1)
        this.setOutputData(0, value);
    };
}


