import type { PrescInfoData } from "@/lib/denshi-shohou/presc-info";
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
    if( memo.kind === "shohou" || memo.kind === "shohou-conv" ){
      console.error("invalid text memo");
    }
    return memo;
  }
}

export class TextMemoWrapper {
  store: string | undefined;

  constructor(store: string | undefined | null){
    if( store === null ){
      store = undefined;
    }
    this.store = store;
  }

  getMemoKind(): "shohou" | "shohou-conv" | undefined {
    const store = this.store;
    if( store === undefined ){
      return undefined;
    } else {
      const json = JSON.parse(store);
      if( json.kind === "shohou" ) {
        return "shohou";
      } else if( json.kind === "shohou-conv" ){
        return "shohou-conv";
      } else {
        throw new Error("invalid text memo");
      }
    }
  }

  probeShohouMemo(): ShohouTextMemo | undefined {
    const store = this.store;
    if( store === undefined ){
      return undefined;
    } else {
      const json = JSON.parse(store);
      if( json.kind === "shohou" ){
        return json;
      } else {
        return undefined;
      }
    }
  }

  probeShohouConvMemo(): ShohouConvTextMemo | undefined {
    const store = this.store;
    if( store === undefined ){
      return undefined;
    } else {
      const json = JSON.parse(store);
      if( json.kind === "shohou-conv" ){
        return json;
      } else {
        return undefined;
      }
    }
  }

  static fromText(text: Text) {
    return new TextMemoWrapper(text.memo);
  }

  static setTextMemo(text: Text, memo: TextMemo) {
    const store = JSON.stringify(memo);
    text.memo = store;
  }
}