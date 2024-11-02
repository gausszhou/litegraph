import { LGraphNodeConstructor } from "@gausszhou/litegraph-core";


export declare class LGraphNode {
  constructor(title: string)
  title
  flags
  graph;
  size
  properties
  boxcolor
  widgets_up
  inputs
  outputs
  isInputConnected(...args: any)
  trigger(...args: any)
  triggerSlot(...args: any)
  addWidget(...args: any)
  getTitle()
  disconnectOutput(slot: number);
  setProperty(...args: any)
  getInputData(slot: number);
  setOutputData(slot: number, value: any);
  onPropertyChanged(name: string, value: any);
  onExecute(...args: any)
  onAction(...args: any)
  onDrawBackground(ctx: CanvasRenderingContext2D);
  onDropFile(file: File)
  onConnectionsChange(...args: any)
}

export declare class LiteGraph {
  registerNodeType(config: LGraphNodeConstructor): void 
}