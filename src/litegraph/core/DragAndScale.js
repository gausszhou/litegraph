

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

//****************************************

//Scale and Offset
export function DragAndScale(element, skip_events) {
	this.offset = new Float32Array([0, 0]);
	this.scale = 1;
	this.max_scale = 10;
	this.min_scale = 0.1;
	this.onredraw = null;
	this.enabled = true;
	this.last_mouse = [0, 0];
	this.element = null;
	this.visible_area = new Float32Array(4);

	if (element) {
		this.element = element;
		if (!skip_events) {
			this.bindEvents(element);
		}
	}
}



DragAndScale.prototype.bindEvents = function (element) {
	this.last_mouse = new Float32Array(2);

	this._binded_mouse_callback = this.onMouse.bind(this);

	LiteGraph.pointerListenerAdd(element, "down", this._binded_mouse_callback);
	LiteGraph.pointerListenerAdd(element, "move", this._binded_mouse_callback);
	LiteGraph.pointerListenerAdd(element, "up", this._binded_mouse_callback);

	element.addEventListener("mousewheel", this._binded_mouse_callback, false);
	element.addEventListener("wheel", this._binded_mouse_callback, false);
};

DragAndScale.prototype.computeVisibleArea = function (viewport) {
	if (!this.element) {
		this.visible_area[0] = this.visible_area[1] = this.visible_area[2] = this.visible_area[3] = 0;
		return;
	}
	let width = this.element.width;
	let height = this.element.height;
	let startx = -this.offset[0];
	let starty = -this.offset[1];
	if (viewport) {
		startx += viewport[0] / this.scale;
		starty += viewport[1] / this.scale;
		width = viewport[2];
		height = viewport[3];
	}
	let endx = startx + width / this.scale;
	let endy = starty + height / this.scale;
	this.visible_area[0] = startx;
	this.visible_area[1] = starty;
	this.visible_area[2] = endx - startx;
	this.visible_area[3] = endy - starty;
};

DragAndScale.prototype.onMouse = function (e) {
	if (!this.enabled) {
		return;
	}

	let canvas = this.element;
	let rect = canvas.getBoundingClientRect();
	let x = e.clientX - rect.left;
	let y = e.clientY - rect.top;
	e.canvasx = x;
	e.canvasy = y;
	e.dragging = this.dragging;

	let is_inside =
		!this.viewport ||
		(this.viewport &&
			x >= this.viewport[0] &&
			x < this.viewport[0] + this.viewport[2] &&
			y >= this.viewport[1] &&
			y < this.viewport[1] + this.viewport[3]);

	//console.log("pointerevents: DragAndScale onMouse "+e.type+" "+is_inside);

	let ignore = false;
	if (this.onmouse) {
		ignore = this.onmouse(e);
	}

	if (e.type == LiteGraph.pointerevents_method + "down" && is_inside) {
		this.dragging = true;
		LiteGraph.pointerListenerRemove(canvas, "move", this._binded_mouse_callback);
		LiteGraph.pointerListenerAdd(document, "move", this._binded_mouse_callback);
		LiteGraph.pointerListenerAdd(document, "up", this._binded_mouse_callback);
	} else if (e.type == LiteGraph.pointerevents_method + "move") {
		if (!ignore) {
			let deltax = x - this.last_mouse[0];
			let deltay = y - this.last_mouse[1];
			if (this.dragging) {
				this.mouseDrag(deltax, deltay);
			}
		}
	} else if (e.type == LiteGraph.pointerevents_method + "up") {
		this.dragging = false;
		LiteGraph.pointerListenerRemove(document, "move", this._binded_mouse_callback);
		LiteGraph.pointerListenerRemove(document, "up", this._binded_mouse_callback);
		LiteGraph.pointerListenerAdd(canvas, "move", this._binded_mouse_callback);
	} else if (is_inside && (e.type == "mousewheel" || e.type == "wheel" || e.type == "DOMMouseScroll")) {
		e.eventType = "mousewheel";
		if (e.type == "wheel") {
			e.wheel = -e.deltaY;
		} else {
			e.wheel = e.wheelDeltaY != null ? e.wheelDeltaY : e.detail * -60;
		}

		//from stack overflow
		e.delta = e.wheelDelta ? e.wheelDelta / 40 : e.deltaY ? -e.deltaY / 3 : 0;
		this.changeDeltaScale(1.0 + e.delta * 0.05);
	}

	this.last_mouse[0] = x;
	this.last_mouse[1] = y;

	if (is_inside) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
};

DragAndScale.prototype.toCanvasContext = function (ctx) {
	ctx.scale(this.scale, this.scale);
	ctx.translate(this.offset[0], this.offset[1]);
};

DragAndScale.prototype.convertOffsetToCanvas = function (pos) {
	//return [pos[0] / this.scale - this.offset[0], pos[1] / this.scale - this.offset[1]];
	return [(pos[0] + this.offset[0]) * this.scale, (pos[1] + this.offset[1]) * this.scale];
};

DragAndScale.prototype.convertCanvasToOffset = function (pos, out) {
	out = out || [0, 0];
	out[0] = pos[0] / this.scale - this.offset[0];
	out[1] = pos[1] / this.scale - this.offset[1];
	return out;
};

DragAndScale.prototype.mouseDrag = function (x, y) {
	this.offset[0] += x / this.scale;
	this.offset[1] += y / this.scale;

	if (this.onredraw) {
		this.onredraw(this);
	}
};

DragAndScale.prototype.changeScale = function (value, zooming_center) {
	if (value < this.min_scale) {
		value = this.min_scale;
	} else if (value > this.max_scale) {
		value = this.max_scale;
	}

	if (value == this.scale) {
		return;
	}

	if (!this.element) {
		return;
	}

	let rect = this.element.getBoundingClientRect();
	if (!rect) {
		return;
	}

	zooming_center = zooming_center || [rect.width * 0.5, rect.height * 0.5];
	let center = this.convertCanvasToOffset(zooming_center);
	this.scale = value;
	if (Math.abs(this.scale - 1) < 0.01) {
		this.scale = 1;
	}

	let new_center = this.convertCanvasToOffset(zooming_center);
	let delta_offset = [new_center[0] - center[0], new_center[1] - center[1]];

	this.offset[0] += delta_offset[0];
	this.offset[1] += delta_offset[1];

	if (this.onredraw) {
		this.onredraw(this);
	}
};

DragAndScale.prototype.changeDeltaScale = function (value, zooming_center) {
	this.changeScale(this.scale * value, zooming_center);
};

DragAndScale.prototype.reset = function () {
	this.scale = 1;
	this.offset[0] = 0;
	this.offset[1] = 0;
};

export default DragAndScale;