import { LiteGraph } from "@gausszhou/litegraph-core"
import installAudio from "@gausszhou/litegraph-nodes-audio"
import installBasic from "@gausszhou/litegraph-nodes-basic"
import installEvents from "@gausszhou/litegraph-nodes-events"
import installGraphics from "@gausszhou/litegraph-nodes-graphics"
import installInput from "@gausszhou/litegraph-nodes-input"
import installLogic from "@gausszhou/litegraph-nodes-logic"
import installMath from "@gausszhou/litegraph-nodes-math"
import installMIDI from "@gausszhou/litegraph-nodes-midi"
import installStrings from "@gausszhou/litegraph-nodes-strings"
import installWidget from "@gausszhou/litegraph-nodes-widget"
import { expect } from "vitest"
import UnitTest from "./UnitTest"

type Install = (litegraph: typeof LiteGraph) => void

const packs: Record<string, Install> = {
    audio: installAudio,
    basic: installBasic,
    events: installEvents,
    graphics: installGraphics,
    input: installInput,
    logic: installLogic,
    math: installMath,
    midi: installMIDI,
    strings: installStrings,
    widget: installWidget,
}

const packTypes: Record<string, string[]> = {}
const allTypes: string[] = []

for (const [name, install] of Object.entries(packs)) {
    const before = new Set(Object.keys(LiteGraph.registered_node_types))
    install(LiteGraph)
    const added = Object.keys(LiteGraph.registered_node_types).filter(type => !before.has(type))
    packTypes[name] = added
    allTypes.push(...added)
}

export default class NodeContractsTests extends UnitTest {
    test__packs__shouldRegisterNodeTypes() {
        for (const [name, types] of Object.entries(packTypes)) {
            expect(types.length, `${name} 未注册任何节点`).toBeGreaterThan(0)
        }
        expect(allTypes.length).toBeGreaterThanOrEqual(90)
    }

    test__eachType__shouldCreateAndRoundTrip() {
        for (const type of allTypes) {
            const node = LiteGraph.createNode(type)
            expect(node, type).not.toBeNull()

            const data = node.serialize()
            const restored = LiteGraph.createNode(type)
            restored.configure(LiteGraph.cloneObject(data))

            expect(restored.type, type).toBe(type)
            expect((restored.inputs ?? []).length, type).toBe((node.inputs ?? []).length)
            expect((restored.outputs ?? []).length, type).toBe((node.outputs ?? []).length)
        }
    }
}
