import { LLink } from "@gausszhou/litegraph-core"
import { expect } from "vitest"
import UnitTest from "./UnitTest"

export default class LLinkTests extends UnitTest {
    test__configure__shouldAcceptSerializedArray() {
        const link = LLink.configure([1, 2, 3, 4, 5, "number"]);

        expect(link.id).toBe(1);
        expect(link.origin_id).toBe(2);
        expect(link.origin_slot).toBe(3);
        expect(link.target_id).toBe(4);
        expect(link.target_slot).toBe(5);
        expect(link.type).toBe("number");
    }

    test__configure__shouldAcceptLinkObject() {
        const source = new LLink(7, "string", 1, 0, 2, 1);

        const link = LLink.configure(source);

        expect(link.serialize()).toStrictEqual([7, 1, 0, 2, 1, "string"]);
    }
}
