import { unifyHokenList, type HokenCollection } from "./hoken-collector";
import { Hokensha, RezeptKouhi } from "./rezept-types";

describe("hoken-collector", () => {
  it("should handle single hoken no kouhi", () => {
    const hokensha: Hokensha = {
      futanWari: 3,
      hokenshaBangou: 123456,
      hihokenshaKigou: "a-3",
      hihokenshaBangou: "123",
    }
    const hc = unifyHokenList([
      { hokensha, kouhiList: [] },
      { hokensha, kouhiList: [] },
      { hokensha, kouhiList: [] },
    ])
    expect(hc).toEqual([{
      hokensha,
      kouhiList: []
    }])
  })

  it("should handle single hoken with one kouhi", () => {
    const hokensha: Hokensha = {
      futanWari: 3,
      hokenshaBangou: 123456,
      hihokenshaKigou: "a-3",
      hihokenshaBangou: "123",
    }
    const kouhi: RezeptKouhi = {
      futansha: 12345678,
      jukyuusha: 11111111,
    }
    let hc = unifyHokenList([
      { hokensha, kouhiList: [] },
      { hokensha, kouhiList: [kouhi] },
    ]);
    expect(hc).toEqual([{ hokensha, kouhiList: [kouhi] }]);
    hc = unifyHokenList([
      { hokensha, kouhiList: [] },
      { hokensha, kouhiList: [kouhi] },
      { hokensha, kouhiList: [kouhi] },
    ]);
    expect(hc).toEqual([{ hokensha, kouhiList: [kouhi] }]);
  })

  it("should handle single hoken with multiple kouhi", () => {
    const hokensha: Hokensha = {
      futanWari: 3,
      hokenshaBangou: 123456,
      hihokenshaKigou: "a-3",
      hihokenshaBangou: "123",
    }
    const kouhi1: RezeptKouhi = {
      futansha: 10345678,
      jukyuusha: 11111111,
    }
    const kouhi2: RezeptKouhi = {
      futansha: 54345678,
      jukyuusha: 11111111,
    }
    let hc = unifyHokenList([
      { hokensha, kouhiList: [] },
      { hokensha, kouhiList: [kouhi1, kouhi2] },
    ]);
    expect(hc).toEqual([{ hokensha, kouhiList: [kouhi1, kouhi2] }]);
    hc = unifyHokenList([
      { hokensha, kouhiList: [kouhi2, kouhi1] },
      { hokensha, kouhiList: [kouhi1] },
      { hokensha, kouhiList: [] },
      { hokensha, kouhiList: [kouhi2] },
    ]);
    expect(hc).toEqual([{ hokensha, kouhiList: [kouhi1, kouhi2] }]);
  })

  it("should handle multiple hoken no kouhi", () => {
    const hokensha1: Hokensha = {
      futanWari: 3,
      hokenshaBangou: 123456,
      hihokenshaKigou: "a-3",
      hihokenshaBangou: "123",
    }
    const hokensha2: Hokensha = {
      futanWari: 3,
      hokenshaBangou: 12345678,
      hihokenshaKigou: "a-3",
      hihokenshaBangou: "123",
    }
    const hc = unifyHokenList([
      { hokensha: hokensha1, kouhiList: [] },
      { hokensha: hokensha2, kouhiList: [] },
      { hokensha: hokensha2, kouhiList: [] },
      { hokensha: hokensha1, kouhiList: [] },
    ])
    expect(hc).toEqual([
      {
        hokensha: hokensha1,
        kouhiList: []
      },
      {
        hokensha: hokensha2,
        kouhiList: []
      },
    ])
  })

  it("should handle multiple hoken with multiple kouhi", () => {
    const hokensha1: Hokensha = {
      futanWari: 3,
      hokenshaBangou: 123456,
      hihokenshaKigou: "a-3",
      hihokenshaBangou: "123",
    }
    const hokensha2: Hokensha = {
      futanWari: 3,
      hokenshaBangou: 12345678,
      hihokenshaKigou: "a-3",
      hihokenshaBangou: "123",
    }
    const kouhi1: RezeptKouhi = {
      futansha: 10345678,
      jukyuusha: 11111111,
    }
    const kouhi2: RezeptKouhi = {
      futansha: 54345678,
      jukyuusha: 11111111,
    }
    let hc = unifyHokenList([
      { hokensha: hokensha1, kouhiList: [] },
      { hokensha: hokensha2, kouhiList: [kouhi2, kouhi1] },
      { hokensha: hokensha1, kouhiList: [kouhi2] },
      { hokensha: hokensha2, kouhiList: [kouhi1, kouhi2] },
    ]);
    expect(hc).toEqual([
      { hokensha: hokensha1, kouhiList: [kouhi2] },
      { hokensha: hokensha2, kouhiList: [kouhi1, kouhi2] },
    ]);
  })
});