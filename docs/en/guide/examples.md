# Example Apps

The repo ships two apps you can run directly: a full-featured editor and a minimal integration example. They also serve as inputs for the example snapshot tests — whether a graph loads and whether serialization is stable is covered by `pnpm test`.

## Full editor `apps/editor`

```bash
pnpm --filter @litegraph/editor dev
```

On top of the minimal example, the editor adds:

- Toolbar: run / pause, save / load, clear, maximize, mini preview, live mode toggle;
- Example dropdown: load built-in demos and `public/examples/*.json` with one click; the view auto-fits the loaded graph;
- Local recovery: the current graph is backed up to `localStorage` when the page unloads and restored on the next visit (you can also switch back from the dropdown);
- Toolbar `Fit` button: fit the whole graph into view at any time, including inside a subgraph;
- Node search box: search nodes by type / title and drag them onto the canvas to create;
- Context menu, properties panel, widget interaction, box selection, snap alignment, groups;
- Two editor-only plugins: `features/*` (ports / widgets / shapes demo nodes) and `circuit/*` (oscillator, LED), installed via `LiteGraph.use()` in `apps/editor/src/Editor.ts`.

### Built-in demos

| Name | Contents |
| --- | --- |
| `Basic1` | One constant into one watch |
| `Basic2` | Two constants, each into its own watch |
| `Basic3` | Two constants + a math operation + three watches |
| `Widgets` | Knob → progress bar, toggle → watch, button event → log |
| `Events` | Timer → counter → watch, logging every change event |
| `Subgraph` | Inner graph "Add 10": constant → subgraph → watch; double-click the subgraph node to enter/leave |
| `Audio1` | `audio/source` → `audio/destination` |
| `Audio2` | Source + knob + analyser + visualization |
| `Audio3` | Audio2 plus an oscilloscope |
| `Circuit1` | `circuit/oscillator` → `circuit/led` |

### Bundled JSON examples

These files live in `apps/editor/public/examples/` and are loaded by the editor via `graph.load(url)`:

| File | Contents |
| --- | --- |
| `features.json` | All four demo node types: `features/slots`, `features/widgets`, `features/shape` and `features/properties_editor` |
| `benchmark.json` | A performance benchmark graph with many nodes and links |
| `subgraph.json` | Subgraphs with `graph/input` and `graph/output` |
| `audio.json` | A fairly complete audio processing chain |
| `audio_delay.json` | Delay node example |
| `audio_reverb.json` | Reverb node example |
| `midi_generation.json` | MIDI generation, quantization and playback |

### live mode

The `LIVE` button on the right side of the editor toolbar toggles `graphCanvas.live_mode`: it hides the grid, node borders, ports and title bars, keeping only node-drawn content. Handy when using the editor as a runtime UI, for example for audio visualization or parameter panels.

## Minimal example `apps/example-minimal`

```bash
pnpm --filter @litegraph/example-minimal dev
```

`src/main.ts` is only a few dozen lines: import core and the `basic` node pack, import styles, create an `LGraph` and an `LGraphCanvas`, drop in a `ConstantNumber` and a `Watch`, connect them and call `graph.start()`. It demonstrates:

- importing `@gausszhou/litegraph-core/style.css` explicitly;
- creating nodes from classes instead of type strings (`LiteGraph.createNode(ConstantNumber)`);
- redrawing the canvas in `onAfterExecute`;
- listening for window resize and calling `graphCanvas.resize()`.

This example is also a snapshot baseline: the test builds `ConstantNumber(4.5) → Watch` the same way, asserts 2 nodes and 1 link, and serializes the result into a snapshot.

## Importing and exporting graphs

What the editor saves is exactly the result of `graph.serialize()`; restore it in any environment like this:

```ts
const graph = new LGraph();
graph.configure(JSON.parse(json));
```

Loading a graph that contains unknown node types does not throw: `configure()` returns `true` and replaces the missing nodes with error nodes. To spot missing packs early, check the return value:

```ts
if (graph.configure(data)) {
  console.warn("The graph has unregistered node types; install the matching node pack");
}
```

## Example snapshot regression

`packages/tests/src/ExamplesSnapshotTests.ts` brings the examples into automated regression, covering 18 cases:

- every JSON file in `apps/editor/public/examples/*.json`: `configure()` returns `false`, the node count matches the file, and serialize → `configure()` again → serialize again is deeply equal;
- the 10 function-style demos in `apps/editor/src/demos.ts`: node count > 0 after building and serialization is stable;
- the minimal example baseline: `ConstantNumber(4.5) → Watch`.

```bash
pnpm test          # everything
pnpm --filter @gausszhou/litegraph-tests test
```

Snapshots live in `packages/tests/src/__snapshots__/main.ts.snap`. Update them **only when you are sure the serialization format change is intentional**:

```bash
pnpm --filter @gausszhou/litegraph-tests exec vitest run -u
```

`pnpm demo:smoke` also opens the built demo in the local Chrome / Chromium, switches through every example and checks that the canvas differs from the Empty state, that node and link counts are greater than zero, that every node is inside the viewport after Fit, and that there are no JS exceptions or `console.error` calls. Add `-- --screenshots` to write a PNG per example to `artifacts/demo-smoke/`; CI runs this and uploads the screenshots as a build artifact (build the editor first).

To add an example:

1. Put the graph JSON in `apps/editor/public/examples/`;
2. Register it in the `addDemo(...)` list in `apps/editor/src/main.ts`;
3. If it uses editor-only nodes (`features/*`, `circuit/*`), make sure the plugin is installed in `Editor.ts`;
4. Run `pnpm test`; the first run creates a snapshot for the new file, so run it again to confirm stability, then commit the snapshot.
