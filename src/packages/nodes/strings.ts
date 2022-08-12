import LiteGraph from "../litegraph";

export function toString(a:any):string {
	if (a && a.constructor === Object) {
		try {
			return JSON.stringify(a);
		} catch (err) {
			return String(a);
		}
	}
	return String(a);
}

LiteGraph.wrapFunctionAsNode("string/toString", toString, [""], "string");


export function compare(a:string, b:string) {
	return a == b;
}

LiteGraph.wrapFunctionAsNode("string/compare", compare, ["string", "string"], "boolean");

export function concatenate(a:any, b:any) {
	if (a === undefined) {
		return b;
	}
	if (b === undefined) {
		return a;
	}
	return a + b;
}

LiteGraph.wrapFunctionAsNode("string/concatenate", concatenate, ["string", "string"], "string");

export function contains(a:string, b:string) {
	if (a === undefined || b === undefined) {
		return false;
	}
	return a.indexOf(b) != -1;
}

LiteGraph.wrapFunctionAsNode("string/contains", contains, ["string", "string"], "boolean");

export function toUpperCase(a:string):string {
	if (a != null && a.constructor === String) {
		return a.toUpperCase();
	}
	return a;
}

LiteGraph.wrapFunctionAsNode("string/toUpperCase", toUpperCase, ["string"], "string");

export function split(str:string|string[], separator:string) {
	if (separator == null) separator = this.properties.separator;
	if (str == null) return [];
	if (str.constructor === String) return str.split(separator || " ");
	else if (str.constructor === Array) {
		var r = [];
		for (var i = 0; i < str.length; ++i) {
			if (typeof str[i] == "string") r[i] = str[i].split(separator || " ");
		}
		return r;
	}
	return null;
}

LiteGraph.wrapFunctionAsNode("string/split", split, ["string,array", "string"], "array", { separator: "," });

export function toFixed(a:number):string |number{
	if (a != null && a.constructor === Number) {
		return a.toFixed(this.properties.precision);
	}
	return a;
}

LiteGraph.wrapFunctionAsNode("string/toFixed", toFixed, ["number"], "string", { precision: 0 });

