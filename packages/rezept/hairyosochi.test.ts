import { hairyosochi } from "./gendogaku";

// 「医療・介護　高額ガイド　令和５年４月版」
describe("配慮措置", () => {
  it("事例１", () => {
    expect(hairyosochi(20000, false)).toMatchObject({ gendogaku: 6000, limitApplied: false });
  });

  it("事例２", () => {
    expect(hairyosochi(200000, false)).toMatchObject({ gendogaku: 18000, limitApplied: true });
  })

  it("事例３", () => {
    expect(hairyosochi(80000, false)).toMatchObject({ gendogaku: 11000, limitApplied: false });
  })

  it("事例４", () => {
    expect(hairyosochi(130000, false)).toMatchObject({ gendogaku: 16000, limitApplied: false });
  })

  it("事例５", () => {
    expect(hairyosochi(100000, true)).toMatchObject({ gendogaku: 9000, limitApplied: true });
  })

  it("事例６", () => {
    expect(hairyosochi(40000, true)).toMatchObject({ gendogaku: 7000, limitApplied: false });
  })

  it("事例７", () => {
    expect(hairyosochi(50000, true)).toMatchObject({ gendogaku: 8000, limitApplied: false });
  })

  it("事例８", () => {
    expect(hairyosochi(50000, true)).toMatchObject({ gendogaku: 8000, limitApplied: false });
  })

})