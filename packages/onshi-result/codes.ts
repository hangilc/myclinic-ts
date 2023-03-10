type valueof<T> = T[keyof T];

export const ReferenceClassification = {
  "1": "マイナンバーカード",
  "2": "被保険者証情報"
} as const;

export type ReferenceClassificationLabel = valueof<typeof ReferenceClassification>;
export type ReferenceClassificationCode = keyof typeof ReferenceClassification;

export function isReferenceClassificationCode(k: string): k is ReferenceClassificationCode {
  return Object.keys(ReferenceClassification).includes(k);
}

export const SegmentOfResult = {
  "1": "正常終了",
  "2": "処理中",
  "9": "異常終了"
} as const;

export type SegmentOfResultLabel = valueof<typeof SegmentOfResult>;
export type SegmentOfResultCode = keyof typeof SegmentOfResult;

export function isSegmentOfResultCode(k: string): k is SegmentOfResultCode {
  return Object.keys(SegmentOfResult).includes(k);
}

export const CharacterCodeIdentifier = {
  "0": "UTF-8",
  "1": "Shift_JIS"
} as const;

export type CharacterCodeIdentifierLabel = valueof<typeof CharacterCodeIdentifier>;
export type CharacterCodeIdentifierCode = keyof typeof CharacterCodeIdentifier;

export function isCharacterCodeIdentifierCode(k: string): k is CharacterCodeIdentifierCode {
  return Object.keys(CharacterCodeIdentifier).includes(k);
}

export const LimitApplicationCertificateRelatedConsFlg = {
  "0": "未同意",
  "1": "同意"
} as const;

export type LimitApplicationCertificateRelatedConsFlgLabel = valueof<typeof LimitApplicationCertificateRelatedConsFlg>;
export type LimitApplicationCertificateRelatedConsFlgCode = keyof typeof LimitApplicationCertificateRelatedConsFlg;

export function isLimitApplicationCertificateRelatedConsFlgCode(k: string): k is LimitApplicationCertificateRelatedConsFlgCode {
  return Object.keys(LimitApplicationCertificateRelatedConsFlg).includes(k);
}






