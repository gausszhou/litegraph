// used by some widgets to render a curve editor
import LGraphCanvas from "../core/LGraphCanvas";
import { clamp, distance } from "../core/utils";

class CurveEditor {
  points: number[][] = [[]]
  selected = -1;
  nearest = -1;
  size: number[] = []; //stores last size used
  must_update = true;
  margin = 5;

  constructor(points: number[][]) {
    this.points = points;
  }

  static sampleCurve(f: number, points: number[][]) {
    if (!points) return;
    for (let i = 0; i < points.length - 1; ++i) {
      let p = points[i];
      let pn = points[i + 1];
      if (pn[0] < f) continue;
      let r = pn[0] - p[0];
      if (Math.abs(r) < 0.00001) return p[1];
      let local_f = (f - p[0]) / r;
      return p[1] * (1.0 - local_f) + pn[1] * local_f;
    }
    return 0;
  };
  draw(ctx: CanvasRenderingContext2D, size: number[], graphcanvas: LGraphCanvas, background_color: string, line_color: string, inactive = false) {
    console.log(graphcanvas)
    let points = this.points;
    if (!points) return;
    this.size = size;
    let w = size[0] - this.margin * 2;
    let h = size[1] - this.margin * 2;

    line_color = line_color || "#666";

    ctx.save();
    ctx.translate(this.margin, this.margin);

    if (background_color) {
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#222";
      ctx.fillRect(w * 0.5, 0, 1, h);
      ctx.strokeStyle = "#333";
      ctx.strokeRect(0, 0, w, h);
    }
    ctx.strokeStyle = line_color;
    if (inactive) ctx.globalAlpha = 0.5;
    ctx.beginPath();
    for (let i = 0; i < points.length; ++i) {
      let p = points[i];
      ctx.lineTo(p[0] * w, (1.0 - p[1]) * h);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    if (!inactive)
      for (let i = 0; i < points.length; ++i) {
        let p = points[i];
        ctx.fillStyle = this.selected == i ? "#FFF" : this.nearest == i ? "#DDD" : "#AAA";
        ctx.beginPath();
        ctx.arc(p[0] * w, (1.0 - p[1]) * h, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    ctx.restore();
  };

  //localpos is mouse in curve editor space
  onMouseDown(localpos:number[], graphcanvas: LGraphCanvas) {
    let points = this.points;
    if (!points) return false;
    if (localpos[1] < 0) return false;

    //this.captureInput(true);
    let w = this.size[0] - this.margin * 2;
    let h = this.size[1] - this.margin * 2;
    let x = localpos[0] - this.margin;
    let y = localpos[1] - this.margin;
    let pos = [x, y];
    let max_dist = 30 / graphcanvas.ds.scale;
    //search closer one
    this.selected = this.getCloserPoint(pos, max_dist);
    //create one
    if (this.selected == -1) {
      let point = [x / w, 1 - y / h];
      points.push(point);
      points.sort(function (a, b) {
        return a[0] - b[0];
      });
      this.selected = points.indexOf(point);
      this.must_update = true;
    }
    if (this.selected != -1) return true;
  };

  onMouseMove(localpos:number[]) {
    let points = this.points;
    if (!points) return;
    let s = this.selected;
    if (s < 0) return;
    let x = (localpos[0] - this.margin) / (this.size[0] - this.margin * 2);
    let y = (localpos[1] - this.margin) / (this.size[1] - this.margin * 2);
    // let curvepos = [localpos[0] - this.margin, localpos[1] - this.margin];
    // let max_dist = 30 / graphcanvas.ds.scale;
    let point = points[s];
    if (point) {
      let is_edge_point = s == 0 || s == points.length - 1;
      if (
        !is_edge_point &&
        (localpos[0] < -10 || localpos[0] > this.size[0] + 10 || localpos[1] < -10 || localpos[1] > this.size[1] + 10)
      ) {
        points.splice(s, 1);
        this.selected = -1;
        return;
      }
      if (!is_edge_point)
        //not edges
        point[0] = clamp(x, 0, 1);
      else point[0] = s == 0 ? 0 : 1;
      point[1] = 1.0 - clamp(y, 0, 1);
      points.sort(function (a, b) {
        return a[0] - b[0];
      });
      this.selected = points.indexOf(point);
      this.must_update = true;
    }
  };

  onMouseUp() {
    this.selected = -1;
    return false;
  };

  getCloserPoint(pos: number[], max_dist: number = 30) {
    let points = this.points;
    if (!points) return -1;
    let w = this.size[0] - this.margin * 2;
    let h = this.size[1] - this.margin * 2;
    let num = points.length;
    let p2 = [0, 0];
    let min_dist = 10;
    let closest = -1;
    for (let i = 0; i < num; ++i) {
      let p = points[i];
      p2[0] = p[0] * w;
      p2[1] = (1.0 - p[1]) * h;    
      let dist = distance(pos, p2);
      if (dist < min_dist || dist > max_dist) {
        continue;
      }
      closest = i;
      min_dist = dist;
    }
    return closest;
  };
}

export default CurveEditor;
