import api from "@/lib/api";
import { eq公費レコード, type PrescInfoData, type 公費レコード } from "@/lib/denshi-shohou/presc-info";
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
    if (memo) {
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
    if (memo && memo.kind === "shohou") {
      return memo;
    } else {
      return undefined;
    }
  }

  probeShohouConvMemo(): ShohouConvTextMemo | undefined {
    const memo = this.getMemo();
    if (memo && memo.kind === "shohou-conv") {
      return memo;
    } else {
      return undefined;
    }
  }

  static fromText(text: Text) {
    return new TextMemoWrapper(text.memo);
  }

  static setTextMemo(text: Text, memo: TextMemo | undefined) {
    if (memo === undefined) {
      text.memo = undefined;
    } else {
      const store = JSON.stringify(memo);
      text.memo = store;
    }
  }

  static getShohouMemo(text: Text): ShohouTextMemo {
    const m = TextMemoWrapper.fromText(text).probeShohouMemo();
    if (!m) {
      throw new Error("cannot get shohou memo");
    } else {
      return m;
    }
  }

  static createShohouTextMemo(shohou: PrescInfoData, prescriptionId: string | undefined): ShohouTextMemo {
    return {
      kind: "shohou",
      shohou: shohou,
      prescriptionId: prescriptionId
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
        備考レコード: src.shohou.備考レコード,
      });
      const dstMemo: ShohouTextMemo = {
        kind: "shohou",
        shohou: dstShohou,
        prescriptionId: undefined,
      };
      return dstMemo;
    } else if (src.kind === "shohou-conv") {
      const visit = await api.getVisit(targetVisitId);
      if (visit.shahokokuhoId === 0 && visit.koukikoureiId === 0) {
        return undefined;
      }
      const dstShohou = await initPrescInfoDataFromVisitId(targetVisitId);
      Object.assign(dstShohou, {
        引換番号: undefined,
        RP剤情報グループ: src.shohou.RP剤情報グループ,
        提供情報レコード: src.shohou.提供情報レコード,
        備考レコード: src.shohou.備考レコード,
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

function checkKouhiCompat(
  src: PrescInfoData,
  dst: PrescInfoData
): string | undefined {
  function compat(
    a: 公費レコード | undefined,
    b: 公費レコード | undefined
  ): boolean {
    if (a && b) {
      return eq公費レコード(a, b);
    } else {
      return a === b;
    }
  }
  if (!compat(src.第一公費レコード, dst.第一公費レコード)) {
    return "第一公費レコードが一致しません。";
  }
  if (!compat(src.第二公費レコード, dst.第二公費レコード)) {
    return "第二公費レコードが一致しません。";
  }
  if (!compat(src.第三公費レコード, dst.第三公費レコード)) {
    return "第三公費レコードが一致しません。";
  }
  if (!compat(src.特殊公費レコード, dst.特殊公費レコード)) {
    return "特殊公費レコードが一致しません。";
  }
  return undefined;
}

export function checkMemoCompat(
  src: TextMemo | undefined,
  dst: TextMemo | undefined
): string | undefined {
  if (src === undefined && dst === undefined) {
    return undefined;
  } else if (src && dst) {
    if (src.kind === "shohou" && dst.kind === src.kind) {
      return checkKouhiCompat(src.shohou, dst.shohou);
    } else if (src.kind === "shohou-conv" && dst.kind === src.kind) {
      return checkKouhiCompat(src.shohou, dst.shohou);
    } else {
    }
  }
  return "inconsistent text memo";
}

