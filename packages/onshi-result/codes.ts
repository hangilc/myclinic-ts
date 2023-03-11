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

export const PrescriptionIssueSelect = {
  "1": "電子処方箋",
  "2": "紙の処方箋",
} as const;

export type PrescriptionIssueSelectLabel = valueof<typeof PrescriptionIssueSelect>;
export type PrescriptionIssueSelectCode = keyof typeof PrescriptionIssueSelect;

export function isPrescriptionIssueSelectCode(k: string): k is PrescriptionIssueSelectCode {
  return Object.keys(PrescriptionIssueSelect).includes(k);
}

export const ProcessingResultStatus = {
  "1": "正常終了",
  "2": "エラー"
} as const;

export type ProcessingResultStatusLabel = valueof<typeof ProcessingResultStatus>;
export type ProcessingResultStatusCode = keyof typeof ProcessingResultStatus;

export function isProcessingResultStatusCode(k: string): k is ProcessingResultStatusCode {
  return Object.keys(ProcessingResultStatus).includes(k);
}

export const InsuredCardClassification = {
  "01": "被保険者証（一般）",
  "02": "被保険者証（退職）",
  "03": "短期被保険者証（一般）",
  "04": "短期被保険者証（退職）",
  "05": "被保険者資格証明書",
  "06": "特例退職被保険者証",
  "07": "自衛官診療証"
} as const;

export type InsuredCardClassificationLabel = valueof<typeof InsuredCardClassification>;
export type InsuredCardClassificationCode = keyof typeof InsuredCardClassification;

export function isInsuredCardClassificationCode(k: string): k is InsuredCardClassificationCode {
  return Object.keys(InsuredCardClassification).includes(k);
}

export const PersonalFamilyClassification = {
  "1": "本人",
  "2": "家族"
} as const;

export type PersonalFamilyClassificationLabel = valueof<typeof PersonalFamilyClassification>;
export type PersonalFamilyClassificationCode = keyof typeof PersonalFamilyClassification;

export function isPersonalFamilyClassificationCode(k: string): k is PersonalFamilyClassificationCode {
  return Object.keys(PersonalFamilyClassification).includes(k);
}






