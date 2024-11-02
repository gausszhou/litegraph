import { ITextWidget, OptionalSlots, PropertyLayout, SlotLayout, Vector2 } from "@gausszhou/litegraph-core"
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

export interface LogEventProperties extends Record<string, any> {
}

export default class LogEvent extends LGraphNode {
    override properties: LogEventProperties = {
    }

    static slotLayout: SlotLayout = {
        inputs: [
            { name: "event", type: BuiltInSlotType.ACTION },
        ],
    }

    static propertyLayout: PropertyLayout = [
    ]

    static optionalSlots: OptionalSlots = {
    }

    override size: Vector2 = [60, 30];

    actionWidget: ITextWidget;
    paramWidget: ITextWidget;
    optionsWidget: ITextWidget;

    constructor(title?: string) {
        super(title)
        this.actionWidget = this.addWidget("text", "Action", "", null, { multiline: true, max_length: 100 })
        this.paramWidget = this.addWidget("text", "Param", "", null, { multiline: true, max_length: 100 })
        this.optionsWidget = this.addWidget("text", "Opts", "", null, { multiline: true, max_length: 100 })
    }

    override onAction(action: any, param: any, options: { action_call?: string }) {
        console.log("[LogEvent] Event received:", action, param, options);
        this.actionWidget.value = JSON.stringify(action);
        this.paramWidget.value = JSON.stringify(param);
        this.optionsWidget.value = JSON.stringify(options);
    }
}

