import { describe, expect, it } from "@jest/globals";
import { isContentLengthTooLarge, MAX_BODY_BYTES } from "./body";

describe("isContentLengthTooLarge", () => {
    it.each([
        { length: undefined, expected: false },
        { length: "100", expected: false },
        { length: String(MAX_BODY_BYTES), expected: false },
        { length: String(MAX_BODY_BYTES + 1), expected: true }
    ])("checks Content-Length=$length", ({ length, expected }) => {
        expect(isContentLengthTooLarge(length)).toBe(expected);
    });
});
