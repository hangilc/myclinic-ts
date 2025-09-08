import type { PrescInfoData } from "@/lib/denshi-shohou/presc-info";
import { clear保険区分レコード } from "@/lib/denshi-shohou/presc-info-helper";
import {
  checkKouhiCompat,
  copyPrescInfoDataToOtherVisit,
  TextMemoWrapper,
  type TextMemo,
} from "@/lib/text-memo";
import type { Text } from "myclinic-model/model";

export async function copyTextToOtherVisit(
  src: Text,
  targetVisitId: number
): Promise<Text> {
  const dst: Text = Object.assign({}, src, {
    textId: 0,
    visitId: targetVisitId,
  });
  const curMemo = TextMemoWrapper.fromText(src).getMemo();
  if (curMemo) {
    const srcMemo = TextMemoWrapper.fromText(src).getMemo();
    if (srcMemo) {
      let dstMemo: TextMemo | undefined = srcMemo;
      if (srcMemo.kind === "shohou") {
        dst.content = "";
        const srcData: PrescInfoData = srcMemo.shohou;
        const dstData: PrescInfoData = await copyPrescInfoDataToOtherVisit(
          srcData,
          targetVisitId
        );
        if( dstData.引換番号 ){
          throw new Error("invalid 引換番号");
        }
        const warn = checkKouhiCompat(srcData, dstData);
        if (typeof warn === "string") {
          alert(`警告：${warn}\nコピー先の保険区分レコードを削除します。`);
          clear保険区分レコード(dstData.RP剤情報グループ);
        }
        dstMemo = {
          kind: "shohou",
          shohou: dstData,
          prescriptionId: undefined,
        };
      } else if (srcMemo.kind === "shohou-conv") {
        dstMemo = undefined; // ignore shohou-conv
      }
      if( dstMemo && dstMemo.kind === "shohou" && dstMemo.prescriptionId ){
        throw new Error("invalid prescriptionId");
      }
      TextMemoWrapper.setTextMemo(dst, dstMemo);
    }
  }
  return dst;
}
