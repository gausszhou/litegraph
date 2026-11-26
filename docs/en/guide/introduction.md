# What is LiteGraph

LiteGraph is a **node-graph engine** written in TypeScript: nodes, ports and links are drawn on an HTML5 Canvas, and a whole graph can be edited, executed and serialized. It is both a visual editor (drag nodes, wire links, edit properties) and a pure dataflow runtime (run graphs in the browser or in Node, no canvas required).

This repository is a TypeScript rewrite of [jagenjo/litegraph.js](https://github.com/jagenjo/litegraph.js) (with some reference to [space-nuko/litegraph.ts](https://github.com/space-nuko/litegraph.ts)), split into a pnpm monorepo: **core engine + pluggable node packs + example apps + docs site**. Unlike upstream, node packs here are separate npm packages you can install on demand; type checking runs with `strict`; builds ship ESM, UMD and `.d.ts`.

## What you can build

- **Visual scripting**: split business logic into node graphs so non-programmers can wire and tune them in the browser.
- **Data/signal flow editing**: audio processing chains, MIDI generation, math, string handling and other built-in nodes compose directly.
- **Live interfaces**: `live_mode` hides the editor grid, node borders and ports, keeping only node-drawn content — ideal for dashboards and control panels.
- **Graph as config**: `graph.serialize()` yields plain JSON that you can store in a database, ship with your app, or use as a plugin format.
- **Embedding in any web app**: all it takes is a `<canvas>` and a container element; the core package has no implicit style dependency — styles are loaded explicitly through the `style.css` subpath.

## Architecture

```text
LiteGraph (global registry + config)
├── LGraph            one graph: nodes, links, groups, I/O, execution loop, serialization
│   ├── LGraphNode    node base class: ports, widgets, properties, serialization, onExecute and other callbacks
│   ├── LLink         a link
│   └── LGraphGroup   a group box on the canvas
├── LGraphCanvas      canvas: events, rendering, UI (three mixins assembled into one class)
│   ├── DragAndScale  viewport zoom and pan
│   └── ContextMenu   context menu
└── Built-in nodes    GraphInput, GraphOutput, Subgraph
```

Key design decisions:

- **Registry pattern**: node types register into `LiteGraph.registered_node_types` at runtime. `LiteGraph.use(install)` installs a node pack and deduplicates, while `LiteGraph.registerNodeType()` handles a single registration and fills in `category` and a default title. Node packs therefore never import each other — they depend only on core.
- **Classes + interface declaration merging + `applyMixins`**: `LGraphCanvas` mixes prototype methods from the event, rendering and UI files into itself, avoiding 42 hand-written wrapper methods; at the type level it is still one complete class.
- **Dataflow + event flow**: regular ports pass values through `getInputData()` / `setOutputData()`; ports typed `event` (`BuiltInSlotType.EVENT`) carry actions and trigger `onAction`.
- **Execution order**: `LGraph.computeExecutionOrder()` topologically sorts nodes by link dependencies; `graph.start()` calls `onExecute` on runnable nodes each frame, and `graph.stop()` ends the loop.
- **Two canvases**: `LGraphCanvas` keeps a background layer and an interaction layer; `draw()` paints the background first and the foreground second, so static content is not redrawn every frame.

## Package matrix

| Package | Description | Nodes |
| --- | --- | --- |
| `@gausszhou/litegraph-core` | Engine core: registry, graph, node, canvas, link, group, subgraph, built-in graph nodes | 3 |
| `@gausszhou/litegraph` | Aggregate package: installs every node pack and re-exports all core APIs and styles | — |
| `@gausszhou/litegraph-nodes-basic` | Constants, watch, reroute, time, comparison, array access | 16 |
| `@gausszhou/litegraph-nodes-math` | Math operations, rounding, random, approximate equality | 5 |
| `@gausszhou/litegraph-nodes-logic` | And / or / not, comparison, branch, selector | 8 |
| `@gausszhou/litegraph-nodes-strings` | String concatenation, JSON parse / stringify, comparison, replace | 12 |
| `@gausszhou/litegraph-nodes-events` | Timer, delay, filter, log, branch | 10 |
| `@gausszhou/litegraph-nodes-input` | Gamepad input | 1 |
| `@gausszhou/litegraph-nodes-widget` | Control nodes: button, toggle, slider, knob, progress bar, panel and more | 10 |
| `@gausszhou/litegraph-nodes-graphics` | Curve plotting | 1 |
| `@gausszhou/litegraph-nodes-audio` | Web Audio nodes: oscillator, filter, delay, reverb, oscilloscope and more | 17 |
| `@gausszhou/litegraph-nodes-midi` | MIDI input / output, generation, quantize, transpose | 12 |

The three core built-in nodes are `graph/input`, `graph/output` and `graph/subgraph`; the 10 node packs add 92 nodes, for **95 node types** in total. See the [node catalog](/en/nodes/) for the full list.

## Repository layout

```text
packages/
  core/            engine core (depends on no node pack)
  litegraph/       aggregate package (core + all node packs)
  nodes-basic/     ┐
  nodes-math/      │
  nodes-logic/     │
  nodes-strings/   ├ 10 node packs, each depending only on core
  nodes-events/    │
  nodes-input/     │
  nodes-widget/    │
  nodes-graphics/  │
  nodes-audio/     │
  nodes-midi/      ┘
  tests/           cross-package tests: core paths, node contracts, interaction, example snapshots
apps/
  editor/          full demo editor (toolbar, example dropdown, mini preview, live mode)
  example-minimal/ minimal integration example
docs/              VitePress docs site
scripts/           build / verification / docs generation scripts
```

## Scope

LiteGraph handles the graph itself: node management, links, execution scheduling, canvas interaction and serialization. The following is up to you or to your nodes:

- node behaviour (`onExecute`, `onDrawForeground`, `onAction` and other callbacks);
- the concrete rendering backend (core is Canvas2D only; `enableWebGL()` is currently a no-op — see the [roadmap](/en/guide/contributing#roadmap));
- persistence and permissions (serialization yields JSON; where it lives and who may change it is the app's decision);
- DOM dependency in the headless runtime: the core entry point never touches `window` implicitly, but `LGraphCanvas` still needs a DOM.

## Next steps

- [Getting Started](/en/guide/getting-started): run the editor or the minimal example in 5 minutes.
- [Packages & Imports](/en/guide/packages): import core, a single node pack or the aggregate package.
- [Node Catalog](/en/nodes/): inputs, outputs, widgets and properties for all 95 node types.
- [API Reference](/en/api/): public API docs generated from source.
