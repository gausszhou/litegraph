// 跨平台文件拷贝：node scripts/copy-file.mjs <src> <dest>
import { mkdirSync, copyFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const [, , from, to] = process.argv;

if (!from || !to) {
  console.error("usage: node scripts/copy-file.mjs <source> <destination>");
  process.exit(1);
}

const source = resolve(process.cwd(), from);
const target = resolve(process.cwd(), to);

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
console.log(`copied ${source} -> ${target}`);
