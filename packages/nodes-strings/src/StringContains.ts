import { LiteGraph, SlotLayout } from "@gausszhou/litegraph-core";

declare class LGraphNode {
    constructor(title: string)
    id
    title
    flags
    graph
    size
    horizontal
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
    onConnectionsChange(...args: any)
    setProperty(...args: any)
    getInputData(slot: number);
    getInputLink(slot: number);
    getOutputLinks(slot: number);
    setOutputData(slot: number, value: any);
    addInput(...args: any)
    addOutput(...args: any)
    removeInput(...args: any)
    removeOutput(...args: any)
    onPropertyChanged(name: string, value: any);
    onExecute(...args: any)
    onAction(...args: any)
    onDrawBackground(ctx: CanvasRenderingContext2D);
    onDropFile(file: File)
}

export default class StringContains extends LGraphNode {
    static slotLayout: SlotLayout = {
        inputs: [
            { name: "A", type: "string" },
            { name: "B", type: "string" },
        ],
        outputs: [
            { name: "contains", type: "string" },
        ],
    }

    override onExecute() {
        const a = this.getInputData(0)
        const b = this.getInputData(1)
        if (a == null || b == null) {
            this.setOutputData(0, false)
        }
        else {
            const value = a.indexOf(b) !== -1;
            this.setOutputData(0, b)
        }
    };
}

