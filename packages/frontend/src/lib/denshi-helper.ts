import type { 負担区分レコード } from "./denshi-shohou/presc-info";

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
