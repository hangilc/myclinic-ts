import { memoStoreToKouhiMemo, toKouhiMemo, toKouhiMemoStore, toSafeConvert } from "../converters";

describe("Memo converters", () => {
  it("should convert to memo store", () => {
    const memo = {
      gendogaku: 2000
    };
    const r = toSafeConvert(toKouhiMemoStore)(memo);
    expect(r.isSuccess()).toBe(true);
    expect(JSON.parse(r.getValue() ?? "")).toMatchObject(memo);
  })
  
  it("should convert empty string to store", () => {
    const memo = "";
    const r = toSafeConvert(toKouhiMemoStore)(memo);
    expect(r.isSuccess()).toBe(true);
    expect(r.getValue()).toBeUndefined();
  })
  
  it("should convert undefined to store", () => {
    const memo = undefined;
    const r = toSafeConvert(toKouhiMemoStore)(memo);
    expect(r.isSuccess()).toBe(true);
    expect(r.getValue()).toBeUndefined();
  })
  
  it("should convert null to store", () => {
    const memo = null;
    const r = toSafeConvert(toKouhiMemoStore)(memo);
    expect(r.isSuccess()).toBe(true);
    expect(r.getValue()).toBeUndefined();
  })

  it("should convert memo store to memo", () => {
    const memo = { gendogaku: 5000 };
    const r = toSafeConvert(memoStoreToKouhiMemo)(JSON.stringify(memo));
    expect(r.isSuccess()).toBe(true);
    expect(r.getValue()).toMatchObject(memo);
  })

  it("should convert empty memo store to memo", () => {
    const memo = { };
    const r = toSafeConvert(memoStoreToKouhiMemo)("");
    expect(r.isSuccess()).toBe(true);
    expect(r.getValue()).toMatchObject(memo);
  })

  it("should convert string gendogaku", () => {
    const r = toSafeConvert(toKouhiMemo)({ gendogaku: "2000"});
    expect(r.isSuccess()).toBe(true);
    expect(r.getValue()).toMatchObject({ gendogaku: 2000 });
  })

  it("should convert empty string gendogaku", () => {
    const r = toSafeConvert(toKouhiMemo)({ gendogaku: ""});
    expect(r.isSuccess()).toBe(true);
    expect(r.getValue()).toMatchObject({ gendogaku: undefined });
  })
})