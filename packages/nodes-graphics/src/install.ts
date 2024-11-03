import GraphicsPlot from "./GraphicsPlot";

export const install = (LiteGraph: any) => {
  LiteGraph.registerNodeType("graphics/plot", GraphicsPlot);
};
