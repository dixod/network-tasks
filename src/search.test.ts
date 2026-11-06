import { describe, expect, it } from "@jest/globals";
import { isValidQuery, parseSearchUrl } from "./search";

describe("isValidQuery", () => {
    it("accepts a non-empty query", () => {
        expect(isValidQuery("node")).toBe(true);
    });

    it("rejects a missing query", () => {
        expect(isValidQuery(null)).toBe(false);
    });

    it("rejects an empty query", () => {
        expect(isValidQuery("")).toBe(false);
    });

    it("rejects a whitespace-only query", () => {
        expect(isValidQuery("   ")).toBe(false);
    });
});

describe("parseSearchUrl", () => {
    it("parses the search path and query", () => {
        const url = parseSearchUrl("/search?q=node");
        expect(url?.pathname).toBe("/search");
        expect(url?.searchParams.get("q")).toBe("node");
    });

    it("rejects a malformed URL without throwing", () => {
        expect(parseSearchUrl("http://[")).toBeNull();
    });
});
