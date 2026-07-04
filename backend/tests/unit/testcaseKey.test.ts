import { describe, it, expect } from "vitest";
import { testcaseKey } from "../../src/utils/func.js";

describe("testcaseKey", () => {
    it("builds key in correct format", () => {
        const key = testcaseKey("Pipeline", "TestName", "Group");

        expect(key).toBe("8:pipeline|5:group|8:testname");
    });

    it("uses default group when not provided", () => {
        const key = testcaseKey("Pipeline", "TestName");

        expect(key).toBe("8:pipeline|7:default|8:testname");
    });

    it("normalizes all inputs (case, spaces)", () => {
        const key = testcaseKey("  PiPeLiNe  ", "  Test   Name  ", "  GrOuP ");

        expect(key).toBe("8:pipeline|5:group|9:test name");
    });

    it("normalizes diacritics", () => {
        const key = testcaseKey("CaféPipe", "ŁódźTest", "Group");

        expect(key).toBe("8:cafepipe|5:group|8:łodztest");
    });

    it("collapses multiple spaces inside values", () => {
        const key = testcaseKey("Pipe Line", "Test   Case", "My   Group");

        expect(key).toBe("9:pipe line|8:my group|9:test case");
    });

    it("is deterministic for same inputs", () => {
        const a = testcaseKey("A", "B", "C");
        const b = testcaseKey("A", "B", "C");

        expect(a).toBe(b);
    });

    it("treats empty string group as default", () => {
        const key1 = testcaseKey("Pipe", "Test", "");
        const key2 = testcaseKey("Pipe", "Test", undefined);

        expect(key1).toBe(key2);
    });
});