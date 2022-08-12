export function toString(a: any): string {
  if (a && a.constructor === Object) {
    try {
      return JSON.stringify(a);
    } catch (err) {
      console.log(err);
      return String(a);
    }
  }
  return String(a);
}

export function compare(a: string, b: string): boolean {
  return a == b;
}

export function concatenate(a: string, b: string): string {
  if (a === undefined) {
    return b;
  }
  if (b === undefined) {
    return a;
  }
  return a + b;
}

export function contains(a: string, b: string) {
  if (a === undefined || b === undefined) {
    return false;
  }
  return a.indexOf(b) != -1;
}

export function toUpperCase(a: string): string {
  if (a != null && a.constructor === String) {
    return a.toUpperCase();
  }
  return a;
}

export function split(str: string | string[], separator: string) {
  // @ts-ignore
  if (separator == null) separator = this.properties.separator;
  if (str == null) return [];
  if (str.constructor === String) return str.split(separator || " ");
  else if (str.constructor === Array) {
    const r = [];
    for (let i = 0; i < str.length; ++i) {
      if (typeof str[i] == "string") r[i] = str[i].split(separator || " ");
    }
    return r;
  }
  return null;
}

export function toFixed(a: number): string | number {
  if (a != null && a.constructor === Number) {
    // @ts-ignore
    return a.toFixed(this.properties.precision);
  }
  return a;
}

const install = (LiteGraph: any) => {
  LiteGraph.wrapFunctionAsNode("string/toString", toString, [""], "string");
  LiteGraph.wrapFunctionAsNode("string/compare", compare, ["string", "string"], "boolean");
  LiteGraph.wrapFunctionAsNode("string/concatenate", concatenate, ["string", "string"], "string");
  LiteGraph.wrapFunctionAsNode("string/contains", contains, ["string", "string"], "boolean");
  LiteGraph.wrapFunctionAsNode("string/toUpperCase", toUpperCase, ["string"], "string");
  LiteGraph.wrapFunctionAsNode("string/split", split, ["string,array", "string"], "array", { separator: "," });
  LiteGraph.wrapFunctionAsNode("string/toFixed", toFixed, ["number"], "string", { precision: 0 });
};

export default { install };
