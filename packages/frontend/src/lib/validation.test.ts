import { it, expect } from "vitest";
import {
  isNotNull,
  validate,
  VError,
  hasError,
  errorMessages,
  getError,
  isNotEmpty,
} from "./validation";

it("should validate non-null", () => {
  const r1 = validate("12", isNotNull(), "digits");
  expect(r1 instanceof VError<string>).toBe(false);
  expect(r1).toBe("12");

  const r2 = validate<string, string | null, string>(
    null,
    isNotNull(),
    "digits"
  );
  expect(hasError(r2)).toBe(true);
  expect(errorMessages(getError(r2))).deep.equal(["digits : Null value"]);
});

it("should validate non-empty string", () => {
  const r1 = validate("hello", isNotEmpty(), "greeting");
  expect(hasError(r1)).toBe(false);
  expect(r1).toBe("hello");
  
  const r2 = validate<string, string, string>("", isNotEmpty(), "greeting");
  expect(hasError(r2)).toBe(true);
  expect(errorMessages(getError(r2))).deep.equal(["greeting : 空白文字です"]);
});

// it("should validate with RegExp", () => {
//   let ve = new VError();
//   const validator = matchRegExp(/^hello+$/);
//   let r = validator.unwrap("hello", "greeting", ve);
//   expect(ve.isEmpty).toBe(true);
//   expect(r).toBe("hello");
//   ve = new VError();
//   r = validator.unwrap(" hello", "greeting", ve);
//   expect(ve.isEmpty).toBe(false);
//   expect(ve.messages).deep.equal(["greeting : 入力が不適切です"]);
// });

// it("should validate toInt", () => {
//   let ve = new VError();
//   const validator = toInt;
//   let r = validator.unwrap("123", "int", ve);
//   expect(ve.isEmpty).toBe(true);
//   expect(r).toBe(123);
//   ve = new VError();
//   r = validator.unwrap("abc", "int", ve);
//   expect(ve.isEmpty).toBe(false);
//   expect(ve.messages).deep.equal(["int : 整数でありません"]);
// });

// it("should validate toFloat", () => {
//   let ve = new VError();
//   const validator = toFloat;
//   let r = validator.unwrap("123.45", "int", ve);
//   expect(ve.isEmpty).toBe(true);
//   expect(r).toBe(123.45);
//   ve = new VError();
//   r = validator.unwrap("abc", "float", ve);
//   expect(ve.isEmpty).toBe(false);
//   expect(ve.messages).deep.equal(["float : 数値でありません"]);
// });

// it("should validate simple object", () => {
//   let ve = new VError();
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
