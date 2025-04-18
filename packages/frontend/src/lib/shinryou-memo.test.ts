import { describe, it, expect } from "vitest";
import { rezeptCommentVerifier } from "./shinryou-memo";

describe("test shinryou-memo", () => {
	it("should pass test", () => {
		const arg = { code: 123456, text: "６０" };
		const r = rezeptCommentVerifier.verify(arg);
		expect(r.ok).toBe(true);
		expect(r.ok && r.value).toEqual(arg);
	});

	it("should check for undefined code", () => {
		const arg = { text: "６０" };
		const r = rezeptCommentVerifier.verify(arg);
		expect(r.ok).toBe(false);
		expect(!r.ok && r.message).toBe("code:値がありません");
	});

	it("should check for non-number code", () => {
		const arg = { code: "1234", text: "６０" };
		const r = rezeptCommentVerifier.verify(arg);
		expect(r.ok).toBe(false);
		expect(!r.ok && r.message).toBe("code:数値でありません");
	});

	it("should check for integer code", () => {
		const arg = { code: 1234.56, text: "６０" };
		const r = rezeptCommentVerifier.verify(arg);
		expect(r.ok).toBe(false);
		expect(!r.ok && r.message).toBe("code:整数でありません");
	});

	it("should check for existent text", () => {
		const arg = { code: 1234, };
		const r = rezeptCommentVerifier.verify(arg);
		expect(r.ok).toBe(false);
		expect(!r.ok && r.message).toBe("text:値がありません");
	});

	it("should check shikibetsucode", () => {
		const arg = { code: 123456, text: "６０", shikibetsucode: "01" };
		const r = rezeptCommentVerifier.verify(arg);
		expect(r.ok).toBe(true);
		expect(r.ok && r.value).toEqual(arg);
	});

	it("should check for invalid shikibetsucode", () => {
		const arg = { code: 123456, text: "６０", shikibetsucode: "ZZ" };
		const r = rezeptCommentVerifier.verify(arg);
		expect(r.ok).toBe(false);
		expect(!r.ok && r.message).toBe("shikibetsucode:正しい診療識別コードでありません");
		// shikibetsucode:undefined でありません,正しい診療識別コードでありません
	});
});

