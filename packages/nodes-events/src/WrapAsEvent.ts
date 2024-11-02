import type { SlotLayout } from "@gausszhou/litegraph-core"
import { BuiltInSlotType } from "@gausszhou/litegraph-core/src/types";
import LGraphNode from "@gausszhou/litegraph-core/src/LGraphNode";

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
