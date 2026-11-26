import { createRequire } from "node:module"

const requireFromHere = createRequire(import.meta.url)
const { JSDOM } = requireFromHere("jsdom")

/**
 * 在 node 环境上手动安装 jsdom 全局。
 * monorepo 根目录的 jsdom 软链在 pnpm 下不可靠，因此从 tests 包自身解析依赖。
 */
const dom = new JSDOM("<!DOCTYPE html>", {
    url: "http://localhost:3000",
    pretendToBeVisual: true,
})

for (const key of Object.getOwnPropertyNames(dom.window)) {
    try {
        if (!(key in globalThis)) {
            (globalThis as any)[key] = (dom.window as any)[key]
        }
    } catch {
        // 忽略只读属性
    }
}
;(globalThis as any).window = dom.window
;(globalThis as any).document = dom.window.document
