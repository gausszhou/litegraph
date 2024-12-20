import { OptionalSlots, PropertyLayout, SlotLayout, Vector2 } from "@gausszhou/litegraph-core"
import LGraphNode from "@gausszhou/litegraph-core/src/LGraphNode";

export interface ConstantObjectProperties extends Record<string, any> {
    value: string,
}

export default class ConstantObject extends LGraphNode {
    override properties: ConstantObjectProperties = {
        value: ""
    }

    static slotLayout: SlotLayout = {
        inputs: [],
        outputs: [
            { name: "obj", type: "object" }
        ]
    }

    static propertyLayout: PropertyLayout = [
    ]

    static optionalSlots: OptionalSlots = {
    }

    override size: Vector2 = [120, 30];

    private _object: object;

    constructor(title?: string) {
        super()
        this._object = {}
    }

    override onExecute() {
        this.setOutputData(0, this._object);
    }
}

