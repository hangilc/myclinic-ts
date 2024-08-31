import type { PrescInfoData } from "@/lib/denshi-shohou/presc-info";
import type { Text } from "myclinic-model";

export type TextMemo = ShohouTextMemo;

export interface ShohouTextMemo {
  kind: "shohou";
  shohou: PrescInfoData;
  prescriptionId: string | undefined;
}

export function getTextMemo(text: Text): TextMemo | undefined {
  let memoString = text.memo;
  if (!memoString) {
    return undefined;
  } else {
    return JSON.parse(memoString);
  }
}

export function modifyTextMemo(text: Text, f: (memo: TextMemo | undefined) => TextMemo | undefined): Text {
  let memo = getTextMemo(text);
  let newMemo = f(memo);
  if( newMemo == undefined ){
    text.memo = undefined;
  } else {
    text.memo = JSON.stringify(newMemo);
  }
  return text;
}
