import { INodeInputSlot, INodeOutputSlot, ITextWidget, LConnectionKind, LLink, PropertyLayout, SlotLayout } from "@gausszhou/litegraph-core";

import LiteCommon from "@gausszhou/litegraph-core/src/LiteCommon";

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

export interface JSONStringifyProperties extends Record<string, any> {
    space: number
}

export default class JSONStringify extends LGraphNode {
    override properties: JSONStringifyProperties = {
        space: 0
    }

    static slotLayout: SlotLayout = {
        inputs: [
            { name: "in", type: "*" },
        ],
        outputs: [
            { name: "out", type: "string" },
            { name: "error", type: "string" },
        ],
    }

    private _value: string = null;
    private _obj: any | null = null;
    private _error: string | null = null;
    private _changed: boolean = false;

    override onExecute() {
        const inputData = this.getInputData(0)
        if (this._changed || this._obj !== inputData) {
            this._value = null;
            this._changed = null;
            this._obj = inputData
            this._error = null;
            const space = this.properties.space;
            try {
                this._value = JSON.stringify(this._obj, null, space)
                this.boxcolor = "#AEA";
            }
            catch (err) {
                this._error = `${err}`
                this.boxcolor = "red";
            }
        }
        else if (inputData == null) {
            this._obj = null;
            this._value = null;
            this._error = null;
            this.boxcolor = LiteCommon.NODE_DEFAULT_BOXCOLOR;
        }
        this.setOutputData(0, this._value)
        this.setOutputData(1, this._error)
    };

    override onConnectionsChange(
        type: LConnectionKind,
        slotIndex: number,
        isConnected: boolean,
        link: LLink,
        ioSlot: (INodeInputSlot | INodeOutputSlot)
    ) {
        // Invalidate cached value
        this._obj = null;
        this._changed = true;
    }
}

