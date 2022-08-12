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

//used by some widgets to render a curve editor
export function CurveEditor(points) {
	this.points = points;
	this.selected = -1;
	this.nearest = -1;
	this.size = null; //stores last size used
	this.must_update = true;
	this.margin = 5;
}

CurveEditor.sampleCurve = function (f, points) {
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

CurveEditor.prototype.draw = function (ctx, size, graphcanvas, background_color, line_color, inactive) {
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
CurveEditor.prototype.onMouseDown = function (localpos, graphcanvas) {
	let points = this.points;
	if (!points) return;
	if (localpos[1] < 0) return;

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

CurveEditor.prototype.onMouseMove = function (localpos, graphcanvas) {
	let points = this.points;
	if (!points) return;
	let s = this.selected;
	if (s < 0) return;
	let x = (localpos[0] - this.margin) / (this.size[0] - this.margin * 2);
	let y = (localpos[1] - this.margin) / (this.size[1] - this.margin * 2);
	let curvepos = [localpos[0] - this.margin, localpos[1] - this.margin];
	let max_dist = 30 / graphcanvas.ds.scale;
	this._nearest = this.getCloserPoint(curvepos, max_dist);
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
			point[0] = Math.clamp(x, 0, 1);
		else point[0] = s == 0 ? 0 : 1;
		point[1] = 1.0 - Math.clamp(y, 0, 1);
		points.sort(function (a, b) {
			return a[0] - b[0];
		});
		this.selected = points.indexOf(point);
		this.must_update = true;
	}
};

CurveEditor.prototype.onMouseUp = function (localpos, graphcanvas) {
	this.selected = -1;
	return false;
};

CurveEditor.prototype.getCloserPoint = function (pos, max_dist) {
	let points = this.points;
	if (!points) return -1;
	max_dist = max_dist || 30;
	let w = this.size[0] - this.margin * 2;
	let h = this.size[1] - this.margin * 2;
	let num = points.length;
	let p2 = [0, 0];
	let min_dist = 1000000;
	let closest = -1;
	let last_valid = -1;
	for (let i = 0; i < num; ++i) {
		let p = points[i];
		p2[0] = p[0] * w;
		p2[1] = (1.0 - p[1]) * h;
		if (p2[0] < pos[0]) last_valid = i;
		let dist = vec2.distance(pos, p2);
		if (dist > min_dist || dist > max_dist) continue;
		closest = i;
		min_dist = dist;
	}
	return closest;
};

export default CurveEditor;
