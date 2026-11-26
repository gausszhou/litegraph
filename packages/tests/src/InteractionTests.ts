import { LGraph, LGraphCanvas, LiteGraph } from "@gausszhou/litegraph-core"
import { ConstantNumber, Watch } from "@gausszhou/litegraph-nodes-basic"
import { expect } from "vitest"
import UnitTest from "./UnitTest"

function createCanvasElement(): HTMLCanvasElement {
    const el = document.createElement("canvas")
    el.width = 800
    el.height = 600
    el.getBoundingClientRect = () => ({
        left: 0, top: 0, right: 800, bottom: 600,
        width: 800, height: 600, x: 0, y: 0,
        toJSON: () => ({}),
    }) as DOMRect
    document.body.appendChild(el)
    return el
}

function dispatchMouse(el: EventTarget, type: string, x: number, y: number, button = 0): void {
    const event = new MouseEvent(type, {
        clientX: x,
        clientY: y,
        button,
        bubbles: true,
        cancelable: true,
    })
    // jsdom 不会根据 button 推导 which，litegraph 的处理器依赖它
    Object.defineProperty(event, "which", { value: button + 1 })
    el.dispatchEvent(event)
}

export default class InteractionTests extends UnitTest {
    private canvases: LGraphCanvas[] = []

    override setUp() {
        document.body.innerHTML = ""
        this.canvases = []
    }

    override tearDown() {
        for (const canvas of this.canvases) {
            if (canvas._events_binded) {
                canvas.unbindEvents()
            }
        }
    }

    private createCanvas(graph: LGraph): { el: HTMLCanvasElement, canvas: LGraphCanvas } {
        const el = createCanvasElement()
        const canvas = new LGraphCanvas(el, graph, { skip_render: true })
        // 关闭渲染时 visible_nodes 不会被计算，交互命中测试需要回退到全部节点
        canvas.visible_nodes = null as any
        this.canvases.push(canvas)
        return { el, canvas }
    }

    test__mousedownOnNode__shouldSelectIt() {
        const graph = new LGraph()
        const node = LiteGraph.createNode(ConstantNumber)
        node.pos = [100, 100]
        graph.add(node)
        const { el, canvas } = this.createCanvas(graph)

        dispatchMouse(el, "mousedown", 150, 120)

        expect(canvas.selected_nodes[node.id]).toBe(node)
        dispatchMouse(el, "mouseup", 150, 120)
    }

    test__draggingNode__shouldMoveIt() {
        const graph = new LGraph()
        const node = LiteGraph.createNode(ConstantNumber)
        node.pos = [100, 100]
        graph.add(node)
        const { el, canvas } = this.createCanvas(graph)

        dispatchMouse(el, "mousedown", 150, 120)
        dispatchMouse(el, "mousemove", 190, 140)
        dispatchMouse(el, "mouseup", 190, 140)

        expect(node.pos[0]).toBeCloseTo(140, 0)
        expect(node.pos[1]).toBeCloseTo(120, 0)
        expect(canvas.node_dragged).toBeNull()
    }

    test__draggingOutputToInput__shouldCreateLink() {
        const graph = new LGraph()
        const source = LiteGraph.createNode(ConstantNumber)
        const target = LiteGraph.createNode(Watch)
        source.pos = [100, 100]
        target.pos = [400, 100]
        graph.add(source)
        graph.add(target)
        const { el } = this.createCanvas(graph)

        const outPos = source.getConnectionPos(false, 0)
        const inPos = target.getConnectionPos(true, 0)

        dispatchMouse(el, "mousedown", outPos[0], outPos[1])
        dispatchMouse(el, "mousemove", inPos[0], inPos[1])
        dispatchMouse(el, "mouseup", inPos[0], inPos[1])

        expect(target.inputs[0].link).not.toBeNull()
        expect(Object.keys(graph.links)).toHaveLength(1)
    }

    test__mouseWheel__shouldChangeScale() {
        const graph = new LGraph()
        const { el, canvas } = this.createCanvas(graph)
        const initialScale = canvas.ds.scale

        el.dispatchEvent(new MouseEvent("mousewheel", {
            clientX: 200,
            clientY: 200,
            detail: 1,
            bubbles: true,
            cancelable: true,
        }))

        expect(canvas.ds.scale).not.toBe(initialScale)
    }

    test__rightClickOnCanvas__shouldOpenContextMenu() {
        const graph = new LGraph()
        const { el } = this.createCanvas(graph)

        dispatchMouse(el, "mousedown", 300, 300, 2)

        expect(document.querySelector(".litecontextmenu")).not.toBeNull()
    }

    test__searchBox__shouldStayInsideViewport() {
        const graph = new LGraph()
        graph.add(LiteGraph.createNode(ConstantNumber))
        const { el, canvas } = this.createCanvas(graph)
        LGraphCanvas.active_canvas = canvas

        const event = new MouseEvent("mousedown", { clientX: 5000, clientY: 5000 })
        Object.defineProperty(event, "layerY", { value: 5000 })
        const dialog = canvas.showSearchBox(event, { show_all_if_empty: false, do_type_filter: false })

        expect(dialog).not.toBeNull()
        expect(parseFloat(dialog.style.left)).toBeLessThanOrEqual(window.innerWidth)
        expect(parseFloat(dialog.style.top)).toBeLessThanOrEqual(window.innerHeight)
        dialog.close()
        expect(el).not.toBeNull()
    }
}
