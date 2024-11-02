import { SlotLayout, Vector2 } from "@gausszhou/litegraph-core";

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

export default class EventBranch extends LGraphNode {
    static slotLayout: SlotLayout = {
        inputs: [
            { name: "in", type: BuiltInSlotType.ACTION },
            { name: "cond", type: "boolean" },
        ],
        outputs: [
            { name: "true", type: BuiltInSlotType.EVENT },
            { name: "false", type: BuiltInSlotType.EVENT },
        ],
    }

    private _value: boolean = false;

    override size: Vector2 = [120, 60];

    override onExecute(param: any, options: object) {
        this._value = this.getInputData(1);
    }

    override onAction(action: any, param: any, options: { action_call?: string }) {
        this._value = this.getInputData(1);
        this.triggerSlot(this._value ? 0 : 1, param, null, options);
    }
}

