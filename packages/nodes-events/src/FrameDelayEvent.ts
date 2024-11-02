import {  OptionalSlots, PropertyLayout, SlotLayout, Vector2 } from "@gausszhou/litegraph-core"
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

export interface FrameDelayEventProperties extends Record<string, any> {
    timeInFrames: number
}

export default class FrameDelayEvent extends LGraphNode {
    override properties: FrameDelayEventProperties = {
        timeInFrames: 30
    }

    static slotLayout: SlotLayout = {
        inputs: [
            { name: "event", type: BuiltInSlotType.ACTION },
        ],
        outputs: [
            { name: "on_time", type: BuiltInSlotType.EVENT },
        ],
    }

    private _pending: [number, any][] = [];

    static propertyLayout: PropertyLayout = [
    ]

    static optionalSlots: OptionalSlots = {
    }

    override size: Vector2 = [60, 30];

    override onAction(action: any, param: any, options: { action_call?: string }) {
        var frames = this.properties.timeInFrames;
        if (frames <= 0) {
            this.trigger(null, param, options);
        } else {
            this._pending.push([frames, param]);
        }
    }

    override onExecute(param: any, options: object) {
        var dt = 1;

        if (this.isInputConnected(1)) {
            this.properties.timeInFrames = this.getInputData(1);
        }

        for (var i = 0; i < this._pending.length; ++i) {
            var actionPass = this._pending[i];
            actionPass[0] -= dt;
            if (actionPass[0] > 0) {
                continue;
            }

            //remove
            this._pending.splice(i, 1);
            --i;

            //trigger
            this.trigger(null, actionPass[1], options);
        }
    }
}

