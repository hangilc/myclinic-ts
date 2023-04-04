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

export function referenceClassificationFromLabel(label: ReferenceClassificationLabel): ReferenceClassificationCode {
  let key: ReferenceClassificationCode;
  for (key in ReferenceClassification) {
    const value = ReferenceClassification[key];
    if( value === label ){
      return key;
    }
  }
  throw new Error("Cannot happen (referenceClassificationFromLabel).");
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

export function segmentOfResultFromLabel(label: SegmentOfResultLabel): SegmentOfResultCode {
  let key: SegmentOfResultCode;
  for (key in SegmentOfResult) {
    const value = SegmentOfResult[key];
    if( value === label ){
      return key;
    }
  }
  throw new Error("Cannot happen (SegmentOfResultCode).");
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

export function characterCodeIdentifierFromLabel(label: CharacterCodeIdentifierLabel): CharacterCodeIdentifierCode {
  let key: CharacterCodeIdentifierCode;
  for (key in CharacterCodeIdentifier) {
    const value = CharacterCodeIdentifier[key];
    if( value === label ){
      return key;
    }
  }
  throw new Error("Cannot happen (CharacterCodeIdentifierCode).");
}

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

// 被保険者証の種類
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

export const Sex = {
  "1": "男",
  "2": "女",
  "3": "未設定"
} as const;

export type SexLabel = valueof<typeof Sex>;
export type SexCode = keyof typeof Sex;

export function isSexCode(k: string): k is SexCode {
  return Object.keys(Sex).includes(k);
}

export const PreschoolClassification = {
  "1": "未就学該当"
} as const;

export type PreschoolClassificationLabel = valueof<typeof PreschoolClassification>;
export type PreschoolClassificationCode = keyof typeof PreschoolClassification;

export function isPreschoolClassificationCode(k: string): k is PreschoolClassificationCode {
  return Object.keys(PreschoolClassification).includes(k);
}

export const ReasonOfLoss = {
  "01": "死亡",
  "02": "生活保護受給開始",
  "03": "医療保険等の資格取得",
  "99": "その他",
} as const;

export type ReasonOfLossLabel = valueof<typeof ReasonOfLoss>;
export type ReasonOfLossCode = keyof typeof ReasonOfLoss;

export function isReasonOfLossCode(k: string): k is ReasonOfLossCode {
  return Object.keys(ReasonOfLoss).includes(k);
}

export const LimitApplicationCertificateClassification = {
  "01": "限度額適用区分認定証",
  "02": "限度額適用・標準負担額減額認定証",
  "03": "標準負担額減額認定証",
} as const;

export type LimitApplicationCertificateClassificationLabel = valueof<typeof LimitApplicationCertificateClassification>;
export type LimitApplicationCertificateClassificationCode = keyof typeof LimitApplicationCertificateClassification;

export function isLimitApplicationCertificateClassificationCode(k: string): k is LimitApplicationCertificateClassificationCode {
  return Object.keys(LimitApplicationCertificateClassification).includes(k);
}

export const LimitApplicationCertificateClassificationFlag = {
  "A01": "ア", // 年収約1,160万円以上
  "A02": "イ",
  "A03": "ウ",
  "A04": "エ",
  "A05": "オ", // 住民税非課税者
  "A06": "オ（境）",
  "B01": "現役並みⅢ",
  "B02": "現役並みⅡ",
  "B03": "現役並みⅠ",
  "B04": "一般",
  "B05": "低所得Ⅱ",
  "B06": "低所得Ⅰ",
  "B07": "低所得Ⅰ（老福）",
  "B08": "低所得Ⅰ（境）",
  "B09": "一般Ⅱ",
  "B10": "一般Ⅰ",
} as const;

export type LimitApplicationCertificateClassificationFlagLabel = valueof<typeof LimitApplicationCertificateClassificationFlag>;
export type LimitApplicationCertificateClassificationFlagCode = keyof typeof LimitApplicationCertificateClassificationFlag;

export function isLimitApplicationCertificateClassificationFlagCode(k: string): k is LimitApplicationCertificateClassificationFlagCode {
  return Object.keys(LimitApplicationCertificateClassificationFlag).includes(k);
}

export const SpecificDiseasesCertificateRelatedConsFlg = {
  "0": "同意なし",
  "1": "同意あり",
  "2": "同意有効期限切れ",
} as const;

export type SpecificDiseasesCertificateRelatedConsFlgLabel = valueof<typeof SpecificDiseasesCertificateRelatedConsFlg>;
export type SpecificDiseasesCertificateRelatedConsFlgCode = keyof typeof SpecificDiseasesCertificateRelatedConsFlg;

export function isSpecificDiseasesCertificateRelatedConsFlgCode(k: string): k is SpecificDiseasesCertificateRelatedConsFlgCode {
  return Object.keys(SpecificDiseasesCertificateRelatedConsFlg).includes(k);
}

// 特定疾病療養受療証認定疾病区分
// OQSCD013
export const SpecificDiseasesDiseaseCategory = {
  "1": "人工透析を必要とする慢性腎不全",
  "2": "先天性血液凝固因子障害（第VIII因子、第IX因子）",
  "3": "血液凝固因子製剤の投与に起因するHIV感染症",
} as const;

export type SpecificDiseasesDiseaseCategoryLabel = valueof<typeof SpecificDiseasesDiseaseCategory>;
export type SpecificDiseasesDiseaseCategoryCode = keyof typeof SpecificDiseasesDiseaseCategory;

export function isSpecificDiseasesDiseaseCategoryCode(k: string): k is SpecificDiseasesDiseaseCategoryCode {
  return Object.keys(SpecificDiseasesDiseaseCategory).includes(k);
}

// 資格有効性
// OQSCD006
export const QualificationValidity = {
  "1": "有効",
  "2": "無効",
  "3": "無効（新しい資格あり）",
  "4": "該当資格なし",
  "5": "複数該当"
} as const;

export type QualificationValidityLabel = valueof<typeof QualificationValidity>;
export type QualificationValidityCode = keyof typeof QualificationValidity;

export function isQualificationValidityCode(k: string): k is QualificationValidityCode {
  return Object.keys(QualificationValidity).includes(k);
}





