import { BuiltInSlotType, SlotType, Vector2 } from "./types";

interface CanvasRenderingContext2D {
    /** like rect but rounded corners */
    roundRect(
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number,
        radiusLow: number
    ): void;
}

export function clamp(v: number, a: number, b: number): number {
    return a > v ? a : b < v ? b : v;
};

export function distance(a: Vector2, b: Vector2): number {
    return Math.sqrt(
        (b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1])
    );
}

export function toHashMap<T>(arr: T[], toKey: (arg: T) => string | number): Record<string, T> {
    return arr.reduce((acc, obj) => {
        const key = toKey(obj);
        acc[key] = obj;
        return acc;
    }, {} as any);
}

export function getStaticProperty<T>(type: any, name: string): T {
    if (name in type) {
        return type[name] as T;
    }
    return null;
}

export function getStaticPropertyOnInstance<T>(type: any, name: string): T {
    if (name in type.constructor) {
        return type.constructor[name] as T;
    }
    return null;
}

function onDrag(e: MouseEvent, el: HTMLElement) {
    if (e.target !== el)
        return

    let offsetX = e.clientX - parseInt(window.getComputedStyle(el).left);
    let offsetY = e.clientY - parseInt(window.getComputedStyle(el).top);

    const mouseMoveHandler = (e: MouseEvent) => {
        if (e.buttons === 0) {
            // In case pointer moved off the element when the mouse was
            // released, so mouseup on this elementnever triggers
            reset();
            return
        }

        el.style.top = (e.clientY - offsetY) + 'px';
        el.style.left = (e.clientX - offsetX) + 'px';
    }

    const reset = () => {
        window.removeEventListener('mousemove', mouseMoveHandler);
        window.removeEventListener('mouseup', reset);
    }

    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', reset);
}

export function makeDraggable(el: HTMLElement): HTMLElement {
    el.addEventListener('mousedown', (e) => onDrag(e, el));
    el.classList.add("draggable")
    return el
}

export function getLitegraphTypeName(type: SlotType): string {
    if (type === BuiltInSlotType.EVENT) {
        return "Event"
    }
    else if (type === BuiltInSlotType.ACTION) {
        return "Action"
    }
    else if (type === BuiltInSlotType.DEFAULT) {
        return "Default"
    }
    return type;
}

export function isValidLitegraphType(type: any): type is SlotType {
    return type === BuiltInSlotType.EVENT
        || type === BuiltInSlotType.ACTION
        || type === BuiltInSlotType.DEFAULT
        || typeof type === "string"
}
