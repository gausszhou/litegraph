import {
  distance,
  colorToString,
  hex2num,
  num2hex,
  compareObjects,
  growBounding,
  isInsideBounding,
  overlapBounding,
  isInsideRectangle
} from "./utils";


import LGraphCanvas from "./LGraphCanvas"
import LGraphNode from "./LGraphNode";
import LGraph from "./LGraph";
import LiteGraph from ".";

interface LGraphGroupOption {
  title: string;
  bounding: number[];
  color: string;
  font: string;
}

class LGraphGroup {
  title: string = "Group";
  color: string = "#AAA";
  pos: any;
  size: any;
  font = '';
  font_size = 24;
  graph: LGraph | null = null;
  private _bounding: Float32Array = new Float32Array([10, 10, 140, 80]);
  private _pos!: Float32Array;
  private _size!: Float32Array;
  private _nodes: LGraphNode[] = [];

  constructor(title: string) {
    this.title = title || "Group";
    this.color = LGraphCanvas.node_colors.pale_blue ? LGraphCanvas.node_colors.pale_blue.groupcolor : "#AAA";
    this._bounding = new Float32Array([10, 10, 140, 80]);
    this._pos = this._bounding.subarray(0, 2);
    this._size = this._bounding.subarray(2, 4);
    this._nodes = [];
    this.graph = null;
    Object.defineProperty(this, "pos", {
      set: function (v) {
        if (!v || v.length < 2) {
          return;
        }
        this._pos[0] = v[0];
        this._pos[1] = v[1];
      },
      get: function () {
        return this._pos;
      },
      enumerable: true
    });

    Object.defineProperty(this, "size", {
      set: function (v) {
        if (!v || v.length < 2) {
          return;
        }
        this._size[0] = Math.max(140, v[0]);
        this._size[1] = Math.max(80, v[1]);
      },
      get: function () {
        return this._size;
      },
      enumerable: true
    });
  }
  // 
  isPointInside = LGraphNode.prototype.isPointInside;
  setDirtyCanvas = LGraphNode.prototype.setDirtyCanvas;

  move(deltax: number, deltay: number, ignore_nodes = false) {
    this._pos[0] += deltax;
    this._pos[1] += deltay;
    if (ignore_nodes) {
      return;
    }
    for (let i = 0; i < this._nodes.length; ++i) {
      let node = this._nodes[i];
      node._pos[0] += deltax;
      node._pos[1] += deltay;
    }
  };
  configure(o: LGraphGroupOption) {
    this.title = o.title;
    this._bounding.set(o.bounding);
    this.color = o.color;
    this.font = o.font;
  };
  serialize() {
    let b = this._bounding;
    return {
      title: this.title,
      bounding: [Math.round(b[0]), Math.round(b[1]), Math.round(b[2]), Math.round(b[3])],
      color: this.color,
      font: this.font
    };
  };
  recomputeInsideNodes () {
    this._nodes.length = 0;
    const nodes = this.graph?._nodes || [];
    const node_bounding = new Float32Array(4);

    for (let i = 0; i < nodes.length; ++i) {
      let node = nodes[i];
      node.getBounding(node_bounding);
      if (!overlapBounding(this._bounding, node_bounding)) {
        continue;
      } //out of the visible area
      this._nodes.push(node);
    }
  };

  static install  (LiteGraph: LiteGraph) {
    LiteGraph.LGraphGroup = LGraphGroup
  };
}



export default LGraphGroup;
