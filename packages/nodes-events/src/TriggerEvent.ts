import type { SlotLayout, Vector2 } from "@gausszhou/litegraph-core"
import { BuiltInSlotType } from "@gausszhou/litegraph-core/src/types";
import LGraphNode from "@gausszhou/litegraph-core/src/LGraphNode";

export interface TriggerEventProperties extends Record<string, any> {
    onlyOnChange: boolean
}

export default class TriggerEvent extends LGraphNode {
    override properties: TriggerEventProperties = {
        onlyOnChange: true
    }

    static slotLayout: SlotLayout = {
        inputs: [
            { name: "if", type: "" },
        ],
        outputs: [
            { name: "true", type: BuiltInSlotType.EVENT },
            { name: "change", type: BuiltInSlotType.EVENT },
            { name: "false", type: BuiltInSlotType.EVENT },
        ],
    }

    private prev: any = 0;

    override size: Vector2 = [60, 30];

    override onExecute(param: any, options: object) {
        var v = this.getInputData(0);
        var changed = (v != this.prev);
        if (this.prev === 0)
            changed = false;
        var must_resend = (changed && this.properties.onlyOnChange) || (!changed && !this.properties.onlyOnChange);
        if (v && must_resend)
            this.triggerSlot(0, v, null, options);
        if (!v && must_resend)
            this.triggerSlot(2, v, null, options);
        if (changed)
            this.triggerSlot(1, v, null, options);
        this.prev = v;
    }
}

