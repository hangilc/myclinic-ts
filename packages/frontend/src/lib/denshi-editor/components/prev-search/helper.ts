import type { RP剤情報 } from "@/lib/denshi-shohou/presc-info";
import { TextMemoWrapper } from "@/lib/text-memo";
import type { Text } from "myclinic-model";
import { parseShohou as parseShohou3 } from "@/lib/parse-shohou3";
import { getRP剤情報FromGroup } from "../../denshi-tmpl";
import type { 薬品情報Edit } from "../../denshi-edit";
import { drugRep } from "../../helper";


export function textToDrugGroups(text: Text): RP剤情報[] {
  let memo = TextMemoWrapper.fromText(text).probeShohouMemo();
  if (memo) {
    return memo.shohou.RP剤情報グループ;
  } else {
    const shohou = parseShohou3(text.content);
    if (typeof shohou !== "string") {
      let groups: RP剤情報[] = shohou.groups.map((g) =>
        getRP剤情報FromGroup(g),
      );
      return groups;
    }
  }
  return [];
}

export function prevDrugRep(drug: 薬品情報Edit, selectedName: string | undefined): string {
    let html = drugRep(drug);
    if (selectedName) {
      return html.replaceAll(
        selectedName,
        `<span style="color: red">${selectedName}</span>`,
      );
    } else {
      return html;
    }
}