---
layout: home

title: LiteGraph
titleTemplate: TypeScript 节点图引擎

hero:
  name: LiteGraph
  text: TypeScript 节点图引擎
  tagline: 在 Canvas2D 上编辑、执行与序列化节点图。核心引擎 + 10 个可插拔节点包，开箱即用。
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 节点目录
      link: /nodes/
    - theme: alt
      text: 在线 Demo
      link: https://gausszhou.github.io/litegraph/demo/

features:
  - title: 可视化编辑
    details: 双层 Canvas 渲染，缩放/平移/分组/多选/对齐吸附，搜索框、右键菜单、属性面板与 widget 一应俱全。
  - title: 图可执行、可序列化
    details: graph.start() 按依赖顺序逐帧执行；整图可序列化为 JSON，在浏览器或 Node 中恢复，无需画布。
  - title: 可插拔节点
    details: 每个节点包导出 install(LiteGraph)，通过 LiteGraph.use() 幂等注册；也可只装 core，按需引入。
  - title: 子图与复用
    details: Subgraph 本身是一个节点，配合 GraphInput / GraphOutput 把任意子图封装成可复用组件。
  - title: TypeScript + Vite
    details: 全部包产出 ESM + UMD 与 .d.ts；UMD 把 core 外置到 window.litegraph，多包共享同一引擎实例。
  - title: 面向测试与发布
    details: CI 覆盖 lint、严格类型、241 个用例、覆盖率门槛、UMD 冒烟与 tarball 校验，节点目录与 API 文档由源码生成。
---
