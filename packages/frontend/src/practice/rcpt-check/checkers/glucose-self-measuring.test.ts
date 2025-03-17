import { describe, it, expect } from "vitest";
import { testExports as f } from "./glucose-self-measuring";

describe("test", () => {
	it("should pass test", () => {
		let c = { code: 842100048, text: "６０" };
		expect(f.checkComment(c)).toBeUndefined();

	});

	it("should check days", () => {
		let c = { code: 842100048, text: "３０" };
		let r = f.checkComment(c); 
		expect(r).not.toBeUndefined();
		expect(r!.code).toBe("該当コメントが不適切です（less then 60）。");
	});

	it("should check invalid days", () => {
		let c = { code: 842100048, text: "６０．２" };
		let r = f.checkComment(c); 
		expect(r).not.toBeUndefined();
		expect(r!.code).toBe("該当コメントが不適切です（not integer）。");
	});

	it("should check empty text", () => {
		let c: any = { code: 842100048 };
		let r = f.checkComment(c); 
		expect(r).not.toBeUndefined();
		expect(r!.code).toBe("該当コメントが不適切です（no text）。");
	});
});


