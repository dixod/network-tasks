import { describe, expect, it } from "@jest/globals";
import { parseUserBody } from "./users";

describe("parseUserBody", () => {
    it("accepts a valid user", () => {
        expect(parseUserBody({ name: "Anna", age: 25 })).toEqual({ name: "Anna", age: 25 });
    });

    it("accepts zero age and preserves the name", () => {
        expect(parseUserBody({ name: " Anna ", age: 0 })).toEqual({ name: " Anna ", age: 0 });
    });

    it("ignores extra fields without changing the input", () => {
        const input = { name: "Anna", age: 25, admin: true };
        expect(parseUserBody(input)).toEqual({ name: "Anna", age: 25 });
        expect(input.admin).toBe(true);
    });

    it.each([null, [], "Anna", 25, true])("rejects a non-object root: %p", value => {
        expect(parseUserBody(value)).toBeNull();
    });

    it.each([
        {},
        { name: " ", age: 25 },
        { name: "Anna", age: -1 },
        { name: "Anna", age: 2.5 },
        { name: "Anna", age: "25" }
    ])("rejects invalid fields: %p", value => {
        expect(parseUserBody(value)).toBeNull();
    });
});
