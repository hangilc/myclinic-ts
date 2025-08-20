import type { 薬品情報, 負担区分レコード } from "./denshi-shohou/presc-info";

export function drugKouhiRep(rec: 負担区分レコード): string {
  const parts: string[] = [];
  function rep(label: string, value: boolean | undefined) {
    if (value === undefined) {
      return;
    }
    const s = value ? "適用" : "不適用";
    parts.push(`${label}${s}`);
  }
  rep("第一公費", rec.第一公費負担区分);
  rep("第二公費", rec.第二公費負担区分);
  rep("第三公費", rec.第三公費負担区分);
  rep("特殊公費", rec.特殊公費負担区分);
  return parts.join("・");
}

export function createEmpty薬品情報(): 薬品情報 {
  return {
    薬品レコード: {
      情報区分: "医薬品",
      薬品コード種別: "レセプト電算処理システム用コード",
      薬品コード: "",
      薬品名称: "",
      分量: "",
      力価フラグ: "薬価単位",
      単位名: ""
    }
  };
}
