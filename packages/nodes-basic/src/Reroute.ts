import type { ContextMenuItem, SlotLayout } from "@gausszhou/litegraph-core";
// import LGraphNode from "@gausszhou/litegraph-core/src/LGraphNode";
import { TitleMode } from "@gausszhou/litegraph-core/src/types";

declare class LGraphNode {
    constructor(title: string)
    title
    flags
    titleMode
    resizable
    size
    properties
    boxcolor
    widgets_up
    inputs
    outputs
    graph
    getTitle()
    addWidget(...args: any)
    getExtraMenuOptions(...args: any)
    disconnectOutput(slot: number);
    setProperty(...args: any)
    getInputData(slot: number);
    setOutputData(slot: number, value: any);
    getInputLink(slot);
    getOutputLinks(slot);
    onPropertyChanged(name: string, value: any);
    onExecute()
    onAction()
    onDrawBackground(ctx: CanvasRenderingContext2D);
    onDropFile(file: File)
}

export default class Reroute extends LGraphNode {
    static slotLayout: SlotLayout = {
        inputs: [
            { name: "", type: "*" },
        ],
        outputs: [
            { name: "", type: "*" }
        ]
    }

    static overrideSize = [60, 30];
    override resizable: boolean = false;
    override titleMode: TitleMode = TitleMode.NO_TITLE;

    override onExecute() {
        this.setOutputData(0, this.getInputData(0));
    }

    override getExtraMenuOptions(_: any, options: ContextMenuItem[]): ContextMenuItem[] | null {
        const canSplice = this.getInputLink(0) != null && this.getOutputLinks(0).length > 0;

        options.push({
            content: "Splice & Remove",
            disabled: !canSplice,
            callback: () => {
                const inputLink = this.getInputLink(0);
                const outputLinks = this.getOutputLinks(0);
                if (!inputLink || !outputLinks)
                    return;

                const inputNode = this.graph.getNodeById(inputLink.origin_id)
                this.graph.removeLink(inputLink.id);

                for (const outputLink of outputLinks) {
                    const outputNode = this.graph.getNodeById(outputLink.target_id)
                    this.graph.removeLink(outputLink.id);

                    inputNode.connect(inputLink.origin_slot, outputNode, outputLink.target_slot);
                }

                this.graph.remove(this);
            }
        })

        return null;
    }
}
