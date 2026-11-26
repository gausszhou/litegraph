import { readFileSync, readdirSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { beforeEach, describe, expect, it } from "vitest"

import { LGraph, LiteGraph } from "@gausszhou/litegraph-core"
import installAudioNodes from "@gausszhou/litegraph-nodes-audio"
import installBasicNodes from "@gausszhou/litegraph-nodes-basic"
import installEventsNodes from "@gausszhou/litegraph-nodes-events"
import installGraphicsNodes from "@gausszhou/litegraph-nodes-graphics"
import installInputNodes from "@gausszhou/litegraph-nodes-input"
import installLogicNodes from "@gausszhou/litegraph-nodes-logic"
import installMathNodes from "@gausszhou/litegraph-nodes-math"
import installMIDINodes from "@gausszhou/litegraph-nodes-midi"
import installStringsNodes from "@gausszhou/litegraph-nodes-strings"
import installWidgetNodes from "@gausszhou/litegraph-nodes-widget"

// The editor demos import the all-in-one bundle, which calls LiteGraph.use() for
// every node pack as a side effect on import.
import * as demos from "../../../apps/editor/src/demos"
// Editor-only plugins: needed by circuit1 (circuit/*) and by the features /
// benchmark examples (features/*). Imported, never modified.
import circuits from "../../../apps/editor/src/circuits/index"
import features from "../../../apps/editor/src/features/index"

const EXAMPLES_DIR = fileURLToPath(
    new URL("../../../apps/editor/public/examples/", import.meta.url),
)

const EXAMPLE_FILES = readdirSync(EXAMPLES_DIR)
    .filter((name) => name.endsWith(".json"))
    .sort()

const NODE_PACK_INSTALLERS = [
    installAudioNodes,
    installBasicNodes,
    installEventsNodes,
    installGraphicsNodes,
    installInputNodes,
    installLogicNodes,
    installMathNodes,
    installMIDINodes,
    installStringsNodes,
    installWidgetNodes,
    circuits,
    features,
]

/** Deep clone so `configure()` cannot mutate the object being snapshotted. */
function clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value))
}

/**
 * Registers the example / demo load snapshot suite exactly once.
 *
 * The main suite is executed twice by main.ts (integer IDs, then string UUIDs);
 * a single registration keeps one snapshot baseline. Every test forces integer
 * IDs so serialized node/link IDs are deterministic.
 */
export function registerExampleSnapshots() {
    describe("examples", () => {
        beforeEach(() => {
            // Fixed environment: snapshots must not depend on the second suite run.
            LiteGraph.use_uuids = false
            for (const install of NODE_PACK_INSTALLERS) {
                LiteGraph.use(install)
            }
        })

        describe("json", () => {
            for (const file of EXAMPLE_FILES) {
                it(`loads ${file}`, () => {
                    const raw = JSON.parse(
                        readFileSync(EXAMPLES_DIR + file, "utf8"),
                    )

                    const graph = new LGraph()
                    const configureError = graph.configure(raw)

                    // configure() returns true when a node type could not be
                    // created (it substitutes an error node). Surface that
                    // instead of silently snapshotting a broken graph.
                    expect(configureError).toBe(false)
                    expect(graph._nodes.length).toBe(raw.nodes.length)

                    const serialized = graph.serialize()

                    // Round-trip: configure the serialized graph into a new LGraph
                    // and make sure serialization is stable. `configure()` rewrites
                    // the links array in place, so clone before feeding it back.
                    const roundTripped = new LGraph()
                    expect(roundTripped.configure(clone(serialized))).toBe(false)
                    expect(roundTripped.serialize()).toEqual(serialized)

                    expect(serialized).toMatchSnapshot()
                })
            }
        })

        describe("demos", () => {
            const demoEntries = Object.entries(demos).filter(
                (entry): entry is [string, (graph: LGraph) => void] =>
                    typeof entry[1] === "function",
            )

            for (const [name, demo] of demoEntries) {
                it(`builds ${name}`, () => {
                    const graph = new LGraph()
                    demo(graph)

                    expect(graph._nodes.length).toBeGreaterThan(0)
                    expect(graph.serialize()).toMatchSnapshot()
                })
            }
        })

        // Mirrors apps/example-minimal/src/main.ts: ConstantNumber -> Watch, 4.5.
        it("builds example-minimal baseline", () => {
            const graph = new LGraph()

            const constNumber = LiteGraph.createNode("basic/number")
            constNumber.pos = [200, 200]
            constNumber.setValue(4.5)

            const watch = LiteGraph.createNode("basic/watch")
            watch.pos = [600, 300]

            graph.add(constNumber)
            graph.add(watch)
            constNumber.connect(0, watch, 0)

            expect(graph._nodes.length).toBe(2)
            expect(Object.keys(graph.links).length).toBe(1)
            expect(graph.serialize()).toMatchSnapshot()
        })
    })
}
