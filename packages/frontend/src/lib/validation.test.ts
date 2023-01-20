import { it, expect } from "vitest";
import { isNotEmpty, isNotNull, matchRegExp, toFloat, toInt, valid, validated2 } from "./validation";

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

it("should validate with RegExp", () => {
  const v = matchRegExp(/^hello+$/)
  const r1 = valid("hello").validate(v).mark("greeting");
  expect(r1.isValid).toBe(true);
  expect(r1.value).toBe("hello");

  const r2 = valid(" hello").validate(v).mark("greeting");
  expect(r2.isValid).toBe(false);
  expect(r2.errorMessage).toBe("greeting : 入力が不適切です");
});

it("should validate toInt", () => {
  const validator = toInt;
  const r1 = valid("123").validate(validator).mark("int");
  expect(r1.isValid).toBe(true);
  expect(r1.value).toBe(123);

  const r2 = valid("abc").validate(validator).mark("int");
  expect(r2.isValid).toBe(false);
  expect(r2.errorMessage).toBe("int : 整数でありません");
});

it("should validate toFloat", () => {
  const validator = toFloat;
  const r1 = valid("123.45").validate(validator).mark("float");
  expect(r1.isValid).toBe(true);
  expect(r1.value).toBe(123.45);

  const r2 = valid("abc").validate(validator).mark("float");
  expect(r2.isValid).toBe(false);
  expect(r2.errorMessage).toBe("float : 数値でありません");
});

it("should validate simple object", () => {
  const idVal = valid("12")
    .validate(isNotEmpty)
    .validate(toInt)
    .mark("id");
  const nameVal = valid("Jane")
    .validate(isNotEmpty)
    .mark("name");
  
  const vs = validated2(idVal, nameVal);
  expect(vs.isValid).toBe(true);
  if( vs.isValid ){
    const [id, name] = vs.value;
    const user = { id, name };
    expect(user).deep.equal({ id: 12, name: "Jane"});
  }
});

it("should detect single object error", () => {
  const idVal = valid("")
    .validate(isNotEmpty)
    .validate(toInt)
    .mark("id");
  const nameVal = valid("Jane")
    .validate(isNotEmpty)
    .mark("name");
  
  const vs = validated2(idVal, nameVal);
  expect(vs.isValid).toBe(false);
  if( !vs.isValid ){
    expect(vs.errorMessages).deep.equal(["id : 空白文字です"]);
  }
});

it("should detect two object errors", () => {
  const idVal = valid("abc")
    .validate(isNotEmpty)
    .validate(toInt)
    .mark("id");
  const nameVal = valid("")
    .validate(isNotEmpty)
    .mark("name");
  
  const vs = validated2(idVal, nameVal);
  expect(vs.isValid).toBe(false);
  if( !vs.isValid ){
    expect(vs.errorMessages).deep.equal([
      "id : 整数でありません",
      "name : 空白文字です"
    ]);
  }
});
