---
layout: home

title: LiteGraph
titleTemplate: TypeScript node-graph engine

hero:
  name: LiteGraph
  text: TypeScript node-graph engine
  tagline: Edit, execute and serialize node graphs on Canvas2D. A core engine plus 10 pluggable node packs, ready out of the box.
  actions:
    - theme: brand
      text: Get Started
      link: /en/guide/getting-started
    - theme: alt
      text: Node Catalog
      link: /en/nodes/
    - theme: alt
      text: Live Demo
      link: https://gausszhou.github.io/litegraph/demo/

features:
  - title: Visual editing
    details: Dual-layer Canvas rendering with zoom, pan, grouping, multi-select and snap alignment — plus a search box, context menu, properties panel and widgets.
  - title: Executable, serializable graphs
    details: graph.start() runs nodes frame by frame in dependency order; a whole graph serializes to JSON and restores in the browser or Node without a canvas.
  - title: Pluggable nodes
    details: Every node pack exports install(LiteGraph) and registers idempotently through LiteGraph.use(); or install just the core and add packs as needed.
  - title: Subgraphs and reuse
    details: A Subgraph is itself a node; together with GraphInput / GraphOutput it turns any subgraph into a reusable component.
  - title: TypeScript + Vite
    details: All packages ship ESM + UMD and .d.ts; UMD externalizes core to window.litegraph so multiple packs share one engine instance.
  - title: Built for testing and release
    details: CI covers lint, strict types, 243 test cases, coverage thresholds, a UMD smoke test and tarball verification; the node catalog and API docs are generated from source.
---
