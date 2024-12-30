import type { PrescInfoData } from "@/lib/denshi-shohou/presc-info";
import { initPrescInfoDataFromVisitId } from "@/lib/denshi-shohou/visit-shohou";
import type { Text } from "myclinic-model";

export type TextMemo = ShohouTextMemo | ShohouConvTextMemo;

export interface ShohouTextMemo {
  kind: "shohou";
  shohou: PrescInfoData;
  prescriptionId: string | undefined;
}

export interface ShohouConvTextMemo {
  kind: "shohou-conv";
  shohou: PrescInfoData;
}

export function getTextMemo(text: Text): TextMemo | undefined {
  let memoString = text.memo;
  if (!memoString) {
    return undefined;
  } else {
    const memo = JSON.parse(memoString);
    if (memo.kind === "shohou" || memo.kind === "shohou-conv") {
      console.error("invalid text memo");
    }
    return memo;
  }
}

export class TextMemoWrapper {
  store: string | undefined;

  constructor(store: string | undefined | null) {
    if (store === null) {
      store = undefined;
    }
    this.store = store;
  }

  getMemo(): TextMemo | undefined {
    const store = this.store;
    if (store === undefined) {
      return undefined;
    } else {
      return JSON.parse(store);
    }
  }

  getMemoKind(): "shohou" | "shohou-conv" | undefined {
    const memo = this.getMemo();
    if( memo ){
      if (memo.kind === "shohou") {
        return "shohou";
      } else if (memo.kind === "shohou-conv") {
        return "shohou-conv";
      } else {
        throw new Error("invalid text memo");
      }

    } else {
      return undefined;
    }
  }

  probeShohouMemo(): ShohouTextMemo | undefined {
    const memo = this.getMemo();
    if( memo && memo.kind === "shohou" ){
      return memo;
    } else {
      return undefined;
    }
  }

  probeShohouConvMemo(): ShohouConvTextMemo | undefined {
    const memo = this.getMemo();
    if( memo && memo.kind === "shohou-conv" ){
      return memo;
    } else {
      return undefined;
    }
  }

  static fromText(text: Text) {
    return new TextMemoWrapper(text.memo);
  }

  static setTextMemo(text: Text, memo: TextMemo | undefined) {
    if( memo === undefined ){
      text.memo = undefined;
    } else {
      const store = JSON.stringify(memo);
      text.memo = store;
    }
  }
}

export async function copyTextMemo(src: TextMemo | undefined, targetVisitId: number): Promise<TextMemo | undefined> {
  if (src == undefined) {
    return undefined;
  } else {
    if (src.kind === "shohou") {
      const dstShohou = await initPrescInfoDataFromVisitId(targetVisitId);
      Object.assign(dstShohou, {
        引換番号: undefined,
        RP剤情報グループ: src.shohou.RP剤情報グループ,
        提供情報レコード: src.shohou.提供情報レコード,
      });
      const dstMemo: ShohouTextMemo = {
        kind: "shohou",
        shohou: dstShohou,
        prescriptionId: undefined,
      };
      return dstMemo;
    } else if (src.kind === "shohou-conv") {
      const dstShohou = await initPrescInfoDataFromVisitId(targetVisitId);
      Object.assign(dstShohou, {
        引換番号: undefined,
        RP剤情報グループ: src.shohou.RP剤情報グループ,
        提供情報レコード: src.shohou.提供情報レコード,
      });
      const dstMemo: ShohouConvTextMemo = {
        kind: "shohou-conv",
        shohou: dstShohou,
      };
      return dstMemo;
    } else {
      throw new Error("cannot happen");
    }
  }
}
