import { it, expect } from "vitest";
import { isNotEmpty, isNotNull, valid } from "./validation";

it("should validate non-null", () => {
  const r1 = valid("12").validate(isNotNull).mark("digits");
  expect(r1.isValid).toBe(true);
  expect(r1.value).toBe("12");

  const r2 = valid<string | null>(null).validate(isNotNull).mark("digits");
  expect(r2.isValid).toBe(false);
  expect(r2.errorMessage).toBe("digits : Null value");
});

it("should validate non-empty string", () => {
  const r1 = valid("hello").validate(isNotEmpty).mark("greeting");
  expect(r1.isValid).toBe(true);
  expect(r1.value).toBe("hello");
  
  const r2 = valid("").validate(isNotEmpty).mark("greeting");
  expect(r2.isValid).toBe(false);
  expect(r2.errorMessage).toBe("greeting : 空白文字です");
});

// it("should validate with RegExp", () => {
//   const v = matchRegExp<string>(/^hello+$/)
//   const r1 = validate("hello", v, "greeting");
//   expect(hasError(r1)).toBe(false);
//   expect(r1).toBe("hello");
//   const r2 = validate(" hello", v, "greeting");
//   expect(hasError(r2)).toBe(true);
//   expect(errorMessages(getError(r2))).deep.equal(["greeting : 入力が不適切です"]);
// });

// it("should validate toInt", () => {
//   const validator = toInt<string>();
//   const r1 = validate("123", validator, "int");
//   expect(hasError(r1)).toBe(false);
//   expect(r1).toBe(123);
//   const r2 = validate("abc", validator, "int");
//   expect(hasError(r2)).toBe(true);
//   expect(errorMessages(getError(r2))).deep.equal(["int : 整数でありません"]);
// });

// it("should validate toFloat", () => {
//   const validator = toFloat<string>();
//   const r1 = validate("123.45", validator, "float");
//   expect(hasError(r1)).toBe(false);
//   expect(r1).toBe(123.45);
//   const r2 = validate("abc", validator, "float");
//   expect(hasError(r2)).toBe(true);
//   expect(errorMessages(getError(r2))).deep.equal(["float : 数値でありません"]);
// });

// it("should validate simple object", () => {
//   const idVal = valid("12")
//     .flatMap(isNotEmpty)
//     .flatMap(toInt)
//     .mark("id");
//   const nameVal = valid("jane")
//     .flatMap(isNotEmpty)
//     .mark("name");
  
//   const vs = validated2<string, _, _>(idVal, nameVal);
//   const user = { 
//     id: isNotEmpty.and(toInt).unwrap("12", "id", ve),
//     name: isNotEmpty.unwrap("Jane", "name", ve)
//   };
//   expect(ve.isEmpty).toBe(true);
//   expect(user).deep.equal({ id: 12, name: "Jane"});
//   const user2 = {
//     id: isNotEmpty.and(toInt).unwrap("", "id", ve),
//     name: isNotEmpty.unwrap("Jane", "name", ve)
//   };
//   expect(ve.isEmpty).toBe(false);
//   expect(ve.messages).deep.equal(["id : 空白文字です"]);
// });
