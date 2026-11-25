import { LGraphCanvas } from "@gausszhou/litegraph-core"
import { expect } from "vitest"
import UnitTest from "./UnitTest"

/**
 * LGraphCanvas 把渲染、UI、事件三组方法以 mixin 方式挂到原型上。
 * 这里锁定 mixin 的表面：方法必须真实存在于原型，菜单静态处理器仍然可用。
 */
export default class CanvasMixinsTests extends UnitTest {
    test__mixins__shouldExposeRenderingAndUiAndEventMethods() {
        expect(typeof LGraphCanvas.prototype.renderLink).toBe("function")
        expect(typeof LGraphCanvas.prototype.getCanvasMenuOptions).toBe("function")
        expect(typeof LGraphCanvas.prototype.processMouseDown).toBe("function")

        // 方法来自 mixin 原型，而不是实例上的包装函数
        expect(Object.prototype.hasOwnProperty.call(LGraphCanvas.prototype, "renderLink")).toBe(true)
        expect(Object.prototype.hasOwnProperty.call(LGraphCanvas.prototype, "getCanvasMenuOptions")).toBe(true)
    }

    test__staticMenuHandlers__shouldBePreserved() {
        expect(typeof LGraphCanvas.onMenuAdd).toBe("function")
        expect(typeof LGraphCanvas.onMenuNodeCollapse).toBe("function")
    }
}
