export type ReferenceClassificationLabel = "マイナンバーカード" | "被保険者証情報";

export const ReferenceClassification: Record<"1" | "2", ReferenceClassificationLabel> = {
  "1": "マイナンバーカード",
  "2": "被保険者証情報"
};

export type SegmentOfResultLabel = 
  "正常終了" | "処理中" | "異常終了";

export const SegmentOfResult: Record<"1" | "2" | "9",  SegmentOfResultLabel> = {
  "1": "正常終了",
  "2": "処理中",
  "9": "異常終了"
}

