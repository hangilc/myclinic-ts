import { HokenProvider, Nanbyou, Payer, calcFutan, jikoFutan } from "./calc";

describe("futan/calc", () => {
  it("should calc jiko futan", () => {
    const futan = jikoFutan(2000, [{ amount: 1400 }]);
    expect(futan).toBe(600);
  });

  it("should calc basic case", () => {
    const shaho = new HokenProvider(3);
    const bill = 2000;
    const instance = calcFutan(bill, [shaho.asPayer()], []);
    expect(instance.payments).toMatchObject([{ amount: 1400 }]);
    expect(jikoFutan(bill, instance.payments)).toBe(600);
  });

  it("should handle nanbyou with futanWari 3", () => {
    const hoken = new HokenProvider(3);
    const nanbyou = new Nanbyou(5000);
    const bill = 2000;
    const instance = calcFutan(bill, [hoken.asPayer(), nanbyou.asPayer()], []);
    console.log(instance);
    expect(jikoFutan(bill, instance.payments)).toBe(400);
  });

  it("should handle nanbyou with futanWari 2", () => {
    const hoken = new HokenProvider(2);
    const nanbyou = new Nanbyou(5000);
    const bill = 2000;
    const instance = calcFutan(bill, [hoken.asPayer(), nanbyou.asPayer()], []);
    console.log(instance);
    expect(jikoFutan(bill, instance.payments)).toBe(400);
  });

  it("should handle nanbyou with futanWari 1", () => {
    const hoken = new HokenProvider(1);
    const nanbyou = new Nanbyou(5000);
    const bill = 2000;
    const instance = calcFutan(bill, [hoken.asPayer(), nanbyou.asPayer()], []);
    console.log(instance);
    expect(jikoFutan(bill, instance.payments)).toBe(200);
  });
});

