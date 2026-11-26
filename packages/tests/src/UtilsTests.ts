import { BuiltInSlotType, clamp, distance, getLitegraphTypeName, getStaticProperty, getStaticPropertyOnInstance, isValidLitegraphType, makeDraggable, toHashMap } from "@gausszhou/litegraph-core"
import { expect } from "vitest"
import UnitTest from "./UnitTest"

export default class UtilsTests extends UnitTest {
    test__clamp__shouldBoundValue() {
        expect(clamp(5, 0, 10)).toBe(5);
        expect(clamp(-1, 0, 10)).toBe(0);
        expect(clamp(11, 0, 10)).toBe(10);
    }

    test__distance__shouldComputeEuclideanDistance() {
        expect(distance([0, 0], [3, 4])).toBe(5);
        expect(distance([1, 1], [1, 1])).toBe(0);
    }

    test__toHashMap__shouldIndexByKey() {
        const list = [{ id: "a", value: 1 }, { id: "b", value: 2 }];
        const map = toHashMap(list, item => item.id);
        expect(map.a.value).toBe(1);
        expect(map.b.value).toBe(2);
    }

    test__getStaticProperty__shouldReadFromConstructor() {
        class WithStatic {
            static answer = 42;
        }
        expect(getStaticProperty<number>(WithStatic, "answer")).toBe(42);
        expect(getStaticProperty(WithStatic, "missing")).toBeNull();
    }

    test__getStaticPropertyOnInstance__shouldReadFromInstanceConstructor() {
        class WithStatic {
            static answer = 7;
        }
        const instance = new WithStatic();
        expect(getStaticPropertyOnInstance<number>(instance, "answer")).toBe(7);
        expect(getStaticPropertyOnInstance(instance, "missing")).toBeNull();
    }

    test__getLitegraphTypeName__shouldHandleBuiltInTypes() {
        expect(getLitegraphTypeName(BuiltInSlotType.EVENT)).toBe("Event");
        expect(getLitegraphTypeName(BuiltInSlotType.ACTION)).toBe("Action");
        expect(getLitegraphTypeName(BuiltInSlotType.DEFAULT)).toBe("Default");
        expect(getLitegraphTypeName("number")).toBe("number");
    }

    test__isValidLitegraphType__shouldAcceptBuiltInsAndStrings() {
        expect(isValidLitegraphType(BuiltInSlotType.EVENT)).toBe(true);
        expect(isValidLitegraphType(BuiltInSlotType.ACTION)).toBe(true);
        expect(isValidLitegraphType(BuiltInSlotType.DEFAULT)).toBe(true);
        expect(isValidLitegraphType("string")).toBe(true);
        expect(isValidLitegraphType({})).toBe(false);
        expect(isValidLitegraphType(1)).toBe(false);
    }

    test__makeDraggable__shouldMoveElement() {
        const el = document.createElement("div");
        el.style.left = "10px";
        el.style.top = "20px";
        document.body.appendChild(el);
        makeDraggable(el);

        el.dispatchEvent(new MouseEvent("mousedown", { clientX: 15, clientY: 25, bubbles: true }));
        window.dispatchEvent(new MouseEvent("mousemove", { clientX: 35, clientY: 45, buttons: 1 }));

        expect(el.style.left).toBe("30px");
        expect(el.style.top).toBe("40px");

        window.dispatchEvent(new MouseEvent("mouseup", { clientX: 35, clientY: 45 }));
        el.remove();
    }
}
