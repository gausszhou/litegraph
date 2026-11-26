# Getting Started

## Prerequisites

- Node.js ≥ 18 (CI uses 20)
- pnpm 12 (the repo pins the version in `package.json`'s `packageManager`)

## Running inside the repo

```bash
pnpm install

# Full demo editor (toolbar, example dropdown, mini preview, live mode)
pnpm --filter @litegraph/editor dev

# Minimal integration example (one ConstantNumber → Watch)
pnpm --filter @litegraph/example-minimal dev

# Build every package and app (in topological order)
pnpm build
```

Docs site:

```bash
pnpm docs:dev     # regenerate the node catalog and API docs, then start VitePress
pnpm docs:build   # output goes to dist/docs
```

Quality-check scripts (CI runs them all):

| Command | Purpose |
| --- | --- |
| `pnpm lint` | ESLint 10 flat config + typescript-eslint |
| `pnpm typecheck` | `tsc --noEmit` for each package |
| `pnpm nullcheck` | Ratchet against the legacy `strictNullChecks` baseline |
| `pnpm test` | Vitest: core, node contracts, interaction, example snapshots |
| `pnpm test:coverage` | Coverage threshold for core paths (lines/statements ≥ 70%, branches ≥ 60%, functions ≥ 66%) |
| `pnpm size` | Raw / gzip size of each artifact |
| `pnpm verify-umd` | Loads core and each pack's UMD in a VM and checks they share one instance |
| `pnpm verify-pack` | Runs `pnpm pack` per package and verifies the tarball contents |

## Using it in your own project

> Packages are not published to npm during 0.1.x; the official release comes with v1.0. Two approaches are recommended for now: reference the source with `workspace:*` inside the same pnpm workspace, or pack tarballs and install them to verify the real artifacts.

### Option 1: workspace references

```json
{
  "dependencies": {
    "@gausszhou/litegraph-core": "workspace:*",
    "@gausszhou/litegraph-nodes-basic": "workspace:*"
  }
}
```

During development each package's `main` / `types` point at `src`, so you can debug the source directly.

### Option 2: install the packed artifacts

```bash
pnpm --filter @gausszhou/litegraph-core pack
pnpm --filter @gausszhou/litegraph-nodes-basic pack

# In your target project
npm install ../litegraph/packages/core/gausszhou-litegraph-core-0.1.0.tgz \
            ../litegraph/packages/nodes-basic/gausszhou-litegraph-nodes-basic-0.1.0.tgz
```

`publishConfig` switches the entry to `dist/index.js` and `dist/index.d.ts`, and exposes CSS through the `style.css` subpath. The aggregate package `@gausszhou/litegraph` depends on every node pack, so installing its tarball alone requires installing all packs too; importing core plus a few packs usually keeps your bundle smaller.

### A minimal Vite project

`index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LiteGraph minimal</title>
  </head>
  <body>
    <canvas id="graph" style="width: 100vw; height: 100vh; display: block"></canvas>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

`src/main.ts`:

```ts
// Styles must be imported explicitly; the core entry does not load CSS for you
import "@gausszhou/litegraph-core/style.css";

import { LGraph, LGraphCanvas, LiteGraph } from "@gausszhou/litegraph-core";
import installBasicNodes, { ConstantNumber, Watch } from "@gausszhou/litegraph-nodes-basic";

// Install the node pack (idempotent: repeated calls do not register twice)
LiteGraph.use(installBasicNodes);

const canvas = document.querySelector<HTMLCanvasElement>("#graph")!;
const graph = new LGraph();
const graphCanvas = new LGraphCanvas(canvas, graph);

// Redraw the canvas after each frame executes
graph.onAfterExecute = () => graphCanvas.draw(true);

// Nodes can be created from a class or from a type string
const source = LiteGraph.createNode(ConstantNumber);
source.pos = [200, 200];
source.setValue(4.5);

const sink = LiteGraph.createNode("basic/watch");
sink.pos = [600, 300];

graph.add(source);
graph.add(sink);
source.connect(0, sink, 0);

window.addEventListener("resize", () => graphCanvas.resize());

graph.start();
```

Key points:

- **Styles**: `@gausszhou/litegraph-core/style.css` must be imported, otherwise nodes, menus and panels are unstyled.
- **Size**: CSS decides the canvas size; call `graphCanvas.resize()` after the window resizes.
- **Canvas and graph**: `new LGraphCanvas(canvas, graph)` binds the two; multiple canvases cannot be bound to the same graph.
- **Render loop**: `graph.start()` drives execution; redrawing is up to you — the common pattern is calling `canvas.draw(true)` in `onAfterExecute`.

## Running graphs without the editor

The core entry point never touches `window` in Node, so you can load, execute and serialize graphs on their own:

```ts
import { LGraph, LiteGraph } from "@gausszhou/litegraph-core";
import installBasicNodes from "@gausszhou/litegraph-nodes-basic";

LiteGraph.use(installBasicNodes);

const graph = new LGraph();
graph.configure(JSON.parse(fs.readFileSync("graph.json", "utf8")));

// Execute one frame
graph.runStep(1);

const watch = graph.getNodeById(2);
console.log(watch?.getOutputData(0));
```

If node logic depends on the DOM, Canvas or Web Audio, you have to provide that environment yourself; node tests use jsdom and a `FakeAudioContext` as stand-ins.

## Core concepts at a glance

| Operation | API |
| --- | --- |
| Register a node | `LiteGraph.registerNodeType({ class, type, title, desc })` or `LiteGraph.registerNodeType("type/name", Class)` |
| Install a node pack | `LiteGraph.use(install)` (recommended) / plain `install(LiteGraph)` |
| Create a node | `LiteGraph.createNode("basic/number")` or `LiteGraph.createNode(ConstantNumber)` |
| Add to a graph | `graph.add(node)` |
| Connect | `source.connect(outputSlot, targetNode, inputSlot)` |
| Run | `graph.start()` / `graph.stop()` / `graph.runStep(n)` |
| Serialize | `graph.serialize()` → JSON; restore with `graph.configure(json)` |
| Subgraph | `LiteGraph.createNode("graph/subgraph")`, together with `graph/input` and `graph/output` |

## FAQ

**The canvas is blank?**
Check that `style.css` is imported, that the canvas has a non-zero size, and that `graph.start()` is called.

**`window is not defined`?**
Import only core and node packs, not code from `apps/editor`; the core entry point itself never touches `window`.

**Two LiteGraph instances (nodes register but cannot be created)?**
Usually core ended up duplicated across chunks. With UMD, make sure core is externalized as `window.litegraph`; with ESM, make your bundler resolve `@gausszhou/litegraph-core` to a single copy (use `workspace:*` in a monorepo).

**Types not found?**
In-repo packages point `types` at `src/index.ts`; after installing a tarball it points at `dist/index.d.ts`. If your editor reports missing types, first check that you installed the packed artifact rather than the source directory.

## Next steps

- [Packages & Imports](/en/guide/packages): trade-offs between the aggregate package, core, individual packs and UMD.
- [Node Catalog](/en/nodes/): inputs, outputs, widgets and properties for all 95 nodes.
- [Example Apps](/en/guide/examples): the editor's built-in demos and JSON examples.
- [Contributing](/en/guide/contributing): adding nodes, tests and docs generation.
