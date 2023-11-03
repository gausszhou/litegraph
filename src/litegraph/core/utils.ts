/**
 * 获取两个坐标点的直线距离
 * @param a 
 * @param b 
 * @returns number
 * @example distance([0, 0], [0, 5])
 */
export function distance(a: number[], b: number[]): number {
  return Math.sqrt((b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1]));
}


export function colorToString(c: number[]) {
  return (
    "rgba(" +
    Math.round(c[0] * 255).toFixed() +
    "," +
    Math.round(c[1] * 255).toFixed() +
    "," +
    Math.round(c[2] * 255).toFixed() +
    "," +
    (c.length == 4 ? c[3].toFixed(2) : "1.0") +
    ")"
  );
}

//Convert a hex value to its decimal value - the inputted hex must be in the
//	format of a hex triplet - the kind we use for HTML colours. The function
//	will return an array with three values.
export function hex2num(hex: string): number[] {
  if (hex.charAt(0) == "#") {
    hex = hex.slice(1);
  } //Remove the '#' char - if there is one.
  hex = hex.toUpperCase();
  let hex_alphabets = "0123456789ABCDEF";
  let value = new Array(3);
  let k = 0;
  let int1, int2;
  for (let i = 0; i < 6; i += 2) {
    int1 = hex_alphabets.indexOf(hex.charAt(i));
    int2 = hex_alphabets.indexOf(hex.charAt(i + 1));
    value[k] = int1 * 16 + int2;
    k++;
  }
  return value;
}

//Give a array with three values as the argument and the function will return
//	the corresponding hex triplet.
export function num2hex(triplet: number[]) {
  let hex_alphabets = "0123456789ABCDEF";
  let hex = "#";
  let int1, int2;
  for (let i = 0; i < 3; i++) {
    int1 = triplet[i] / 16;
    int2 = triplet[i] % 16;

    hex += hex_alphabets.charAt(int1) + hex_alphabets.charAt(int2);
  }
  return hex;
}

/**
 * 比较两个对象是否相等
 * @param a 
 * @param b 
 * @returns 
 */
export function compareObjects(a: any, b: any): boolean {
  for (let i in a) {
    if (a[i] != b[i]) {
      return false;
    }
  }
  return true;
}

// [minx,miny,maxx,maxy]
export function growBounding(bounding: number[], x: number, y: number) {
  if (x < bounding[0]) {
    bounding[0] = x;
  } else if (x > bounding[2]) {
    bounding[2] = x;
  }

  if (y < bounding[1]) {
    bounding[1] = y;
  } else if (y > bounding[3]) {
    bounding[3] = y;
  }
}

/**
 * point inside bounding box
 * @param p [x, y]
 * @param bb [[x1, y1], [x2, y2]]
 * @returns 
 */
export function isInsideBounding(p: number[], bb: number[][]): boolean {
  if (p[0] < bb[0][0] || p[1] < bb[0][1] || p[0] > bb[1][0] || p[1] > bb[1][1]) {
    return false;
  }
  return true;
}

/**
 * 判断两个矩形是否重叠
 * @param a bounding overlap, format: [ startx, starty, width, height ]
 * @param b bounding overlap, format: [ startx, starty, width, height ]
 * @returns 
 */
export function overlapBounding(a: number[] | Float32Array, b: number[] | Float32Array) {
  let A_end_x = a[0] + a[2];
  let A_end_y = a[1] + a[3];
  let B_end_x = b[0] + b[2];
  let B_end_y = b[1] + b[3];

  if (a[0] > B_end_x || a[1] > B_end_y || A_end_x < b[0] || A_end_y < b[1]) {
    return false;
  }
  return true;
}

/**
 * 判断坐标点是否在矩形范围内
 * @param x 
 * @param y 
 * @param left 
 * @param top 
 * @param width 
 * @param height 
 * @returns 
 */
export function isInsideRectangle(
  x: number,
  y: number,
  left: number,
  top: number,
  width: number,
  height: number
): boolean {
  if (left < x && left + width > x && top < y && top + height > y) {
    return true;
  }
  return false;
}

/**
 * 获取当前时间戳
 * @returns 
 */
export function getTime(): number {
  return new Date().getTime();
}

/**
 * 控制 v 的数值在 a 和 b 之间
 * @param v 
 * @param a 
 * @param b 
 * @returns 
 */
export function clamp(v: number, a: number, b: number): number {
  return a > v ? a : b < v ? b : v;
}
