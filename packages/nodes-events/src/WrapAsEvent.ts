import type { SlotLayout } from "@gausszhou/litegraph-core"
import { BuiltInSlotType } from "@gausszhou/litegraph-core/src/types";
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
}

export interface WrapAsEventProperties extends Record<string, any> {
}

export default class WrapAsEvent extends LGraphNode {
    override properties: WrapAsEventProperties = {
    }

    static slotLayout: SlotLayout = {
        inputs: [
            { name: "trigger", type: BuiltInSlotType.ACTION },
            { name: "param", type: "" },
        ],
        outputs: [
            { name: "event", type: BuiltInSlotType.EVENT },
        ],
    }

    override onAction(action: any, param: any, options: { action_call?: string }) {
        var v = this.getInputData(1);
        this.triggerSlot(0, v, null, options);
    }
}
