import { describe, it, expect } from "vitest";
import { checkForShinryoucode114007410 } from "./glucose-self-measuring";

describe("test", () => {
	it("should pass test", () => {
		let c = { code: 842100048, text: "６０" };
		expect(checkForShinryoucode114007410(c)).toBeUndefined();

	});

	it("should check days", () => {
		let c = { code: 842100048, text: "３０" };
		let r = checkForShinryoucode114007410(c); 
		expect(r).not.toBeUndefined();
		expect(r!.code).toBe("該当コメントが不適切です（less then 60）。");
	});

	it("should check invalid days", () => {
		let c = { code: 842100048, text: "６０．２" };
		let r = checkForShinryoucode114007410(c); 
		expect(r).not.toBeUndefined();
		expect(r!.code).toBe("該当コメントが不適切です（not integer）。");
	});
});


