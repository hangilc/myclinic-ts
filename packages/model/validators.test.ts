import { DateInput, validateKouhi } from "./validators";

describe("model validators", () => {

  it("should validate kouhi", () => {
    const obj = {
      kouhiId: 1,
      futansha: 12345678,
      jukyuusha: 11111111,
      validFrom: "2023-11-01",
      validUpto: "2024-10-31",
      patientId: 123,
    };
    const r = validateKouhi(obj);
    expect(r.isSuccess()).toBe(true);
    expect(r.getValue()).toMatchObject(obj);
  });

  it("should check futansha and jukyuusha in kouhi", () => {
    const obj = {
      kouhiId: 1,
      validFrom: "2023-11-01",
      validUpto: "2024-10-31",
      patientId: 123,
    };
    const r = validateKouhi(obj);
    expect(r.isSuccess()).toBe(false);
    expect(r.getErrorMessage()).toBe("負担者：設定されていません。\n受給者：設定されていません。");
  });

  it("should validate valildFrom in kouhi", () => {
    const obj = {
      kouhiId: 1,
      futansha: 12345678,
      jukyuusha: 11111111,
      validFrom: "20231101",
      validUpto: "2024-10-31",
      patientId: 123,
    };
    const r = validateKouhi(obj);
    expect(r.isSuccess()).toBe(false);
    expect(r.getErrorMessage()).toBe("期限開始：日付が不適切です。");
  });

  it("should coerce Date to valildFrom in kouhi", () => {
    const obj = {
      kouhiId: 1,
      futansha: 12345678,
      jukyuusha: 11111111,
      validFrom: new Date(2023, 10, 1),
      validUpto: "2024-10-31",
      patientId: 123,
    };
    const kouhi = validateKouhi(obj);
    const r = validateKouhi(obj);
    expect(r.isSuccess()).toBe(true);
    expect(r.getValue()).toMatchObject(Object.assign({}, obj, { validFrom: "2023-11-01" }));
  });

  it("should coerce DateInput object to valildFrom in kouhi", () => {
    const obj = {
      kouhiId: 1,
      futansha: 12345678,
      jukyuusha: 11111111,
      validFrom: new DateInput({ gengou: "令和", nen: "5", month: "11", day: "1" }),
      validUpto: "2024-10-31",
      patientId: 123,
    };
    const r = validateKouhi(obj);
    expect(r.isSuccess()).toBe(true);
    expect(r.getValue()).toMatchObject(Object.assign({}, obj, { validFrom: "2023-11-01" }));
  });

  it("should check DateInput object to valildFrom in kouhi", () => {
    const obj = {
      kouhiId: 1,
      futansha: 12345678,
      jukyuusha: 11111111,
      validFrom: new DateInput({ gengou: "令和", nen: "5", month: "", day: "1" }),
      validUpto: "2024-10-31",
      patientId: 123,
    };
    const r = validateKouhi(obj);
    expect(r.isSuccess()).toBe(false);
    expect(r.getErrorMessage()).toBe("期限開始：月：空白です。")
  });

  it("should coerce to valildUpto in kouhi", () => {
    const obj = {
      kouhiId: 1,
      futansha: 12345678,
      jukyuusha: 11111111,
      validFrom: "2023-11-01",
      validUpto: new Date(2024, 9, 31),
      patientId: 123,
    };
    const r = validateKouhi(obj);
    expect(r.isSuccess()).toBe(true);
    expect(r.getValue()).toMatchObject(Object.assign({}, obj, { validUpto: "2024-10-31" }));
  });

  it("should coerce null to valildUpto in kouhi", () => {
    const obj = {
      kouhiId: 1,
      futansha: 12345678,
      jukyuusha: 11111111,
      validFrom: "2023-11-01",
      validUpto: "0000-00-00",
      patientId: 123,
    };
    const r = validateKouhi(obj);
    expect(r.isSuccess()).toBe(true);
    expect(r.getValue()).toMatchObject(obj);
  });

  it("should coerce null to valildUpto in kouhi", () => {
    const obj = {
      kouhiId: 1,
      futansha: 12345678,
      jukyuusha: 11111111,
      validFrom: "2023-11-01",
      validUpto: null,
      patientId: 123,
    };
    const r = validateKouhi(obj);
    expect(r.isSuccess()).toBe(true);
    expect(r.getValue()).toMatchObject(Object.assign({}, obj, { validUpto: "0000-00-00" }));
  });

  it("should coerce undefined to valildUpto in kouhi", () => {
    const obj = {
      kouhiId: 1,
      futansha: 12345678,
      jukyuusha: 11111111,
      validFrom: "2023-11-01",
      patientId: 123,
    };
    const r = validateKouhi(obj);
    expect(r.isSuccess()).toBe(true);
    expect(r.getValue()).toMatchObject(Object.assign({}, obj, { validUpto: "0000-00-00" }));
  });

  // it("should coerce empty string to valildUpto in kouhi", () => {
  //   const obj = {
  //     kouhiId: 1,
  //     futansha: 12345678,
  //     jukyuusha: 11111111,
  //     validFrom: "2023-11-01",
  //     validUpto: "",
  //     patientId: 123,
  //   };
  //   const kouhi = validateKouhi(obj);
  //   expect(kouhi).toMatchObject(Object.assign({}, obj, { validUpto: "0000-00-00" }));
  // });

  // it("should coerce string to number in kouhi", () => {
  //   const obj = {
  //     kouhiId: 1,
  //     futansha: "12345678",
  //     jukyuusha: "11111111",
  //     validFrom: "2023-11-01",
  //     validUpto: "2024-10-31",
  //     patientId: 123,
  //   };
  //   const kouhi = validateKouhi(obj);
  //   expect(kouhi).toMatchObject(Object.assign({}, obj, { futansha: parseInt(obj.futansha), jukyuusha: parseInt(obj.jukyuusha) }));
  // });

  // it("should rule out invalid JSON memo in kouhi", () => {
  //   const obj = {
  //     kouhiId: 1,
  //     futansha: 12345678,
  //     jukyuusha: 11111111,
  //     validFrom: "2023-11-01",
  //     validUpto: "2024-10-31",
  //     patientId: 123,
  //     memo: '{a:2}',
  //   };
  //   expect(() => validateKouhi(obj)).toThrow(ValiError);
  // });

  // it("should validate memo in kouhi", () => {
  //   const obj = {
  //     kouhiId: 1,
  //     futansha: 12345678,
  //     jukyuusha: 11111111,
  //     validFrom: "2023-11-01",
  //     validUpto: "2024-10-31",
  //     patientId: 123,
  //     memo: '{"gendogaku":5000}',
  //   };
  //   const kouhi = validateKouhi(obj);
  //   expect(kouhi).toMatchObject(obj);
  // });

});