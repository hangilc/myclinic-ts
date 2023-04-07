import type { OnshiKakuninQuery } from "@/lib/onshi-confirm";
import { OnshiResult } from "onshi-result";
import type { MessageBodyInterface } from "onshi-result/MessageBody";
import type { MessageHeaderInterface } from "onshi-result/MessageHeader";
import { fromSqlDateTime, fromSqlDate } from "onshi-result/util";
import { dateToSqlDate, dateToSqlDateTime, Patient, Shahokokuho } from "myclinic-model";
import type { ResultOfQualificationConfirmationInterface } from "onshi-result/ResultOfQualificationConfirmation";
import { characterCodeIdentifierFromLabel, insuredCardClassificationFromLabel, personalFamilyClassificationFromLabel, prescriptionIssueSelectFromLabel, processingResultStatusFromLabel, qualificationValidityFromLabel, referenceClassificationFromLabel, segmentOfResultFromLabel, sexFromLabel, type CharacterCodeIdentifierCode, type InsuredCardClassificationCode, type InsuredCardClassificationLabel, type LimitApplicationCertificateClassificationCode, type LimitApplicationCertificateClassificationFlagCode, type LimitApplicationCertificateRelatedConsFlgCode, type PersonalFamilyClassificationCode, type PreschoolClassificationCode, type PrescriptionIssueSelectCode, type ProcessingResultStatusCode, type QualificationValidityCode, type ReasonOfLossCode, type ReferenceClassificationCode, type SegmentOfResultCode, type SexCode, type SpecificDiseasesCertificateRelatedConsFlgCode } from "onshi-result/codes";
import type { QualificationConfirmSearchInfoInterface } from "onshi-result/QualificationConfirmSearchInfo";
import type { ElderlyRecipientCertificateInfoInterface } from "onshi-result/ElderlyRecipientCertificateInfo";
import type { LimitApplicationCertificateRelatedInfoInterface } from "onshi-result/LimitApplicationCertificateRelatedInfo";
import type { SpecificDiseasesCertificateInfoInterface } from "onshi-result/SpecificDiseasesCertificateInfo";

export interface MessageHeaderCreationSpec {
  ProcessExecutionTime?: string | Date;
  QualificationConfirmationDate?: string | Date;
  MedicalInstitutionCode?: string;
  ArbitraryFileIdentifier?: string;
  ReferenceClassification?: ReferenceClassificationCode;
  SegmentOfResult?: SegmentOfResultCode;
  ErrorCode?: string;
  ErrorMessage?: string;
  CharacterCodeIdentifier?: CharacterCodeIdentifierCode;
}

export function createMessageHeaderInterface(spec: MessageHeaderCreationSpec): MessageHeaderInterface {
  function resolveDateTime(src: string | Date | undefined): string {
    if (src === undefined) {
      src = new Date();
    }
    if (src instanceof Date) {
      src = dateToSqlDateTime(src);
    }
    return fromSqlDateTime(src);
  }

  return {
    ProcessExecutionTime: resolveDateTime(spec.ProcessExecutionTime),
    QualificationConfirmationDate: resolveDateTime(spec.QualificationConfirmationDate),
    MedicalInstitutionCode: spec.MedicalInstitutionCode ?? "1312345678",
    ArbitraryFileIdentifier: spec.ArbitraryFileIdentifier,
    ReferenceClassification: spec.ReferenceClassification ?? referenceClassificationFromLabel("マイナンバーカード"),
    SegmentOfResult: spec.SegmentOfResult ?? segmentOfResultFromLabel("正常終了"),
    ErrorCode: spec.ErrorCode,
    ErrorMessage: spec.ErrorMessage,
    CharacterCodeIdentifier: spec.CharacterCodeIdentifier ?? characterCodeIdentifierFromLabel("UTF-8"),
  }
}

export interface MessageBodyCreationSpec {
  ProcessingResultStatus?: ProcessingResultStatusCode;
  ResultList?: ResultOfQualificationConfirmationCreationSpec[];
  QualificationConfirmSearchInfo?: QualificationConfirmSearchInfoInterface;
  PrescriptionIssueSelect?: PrescriptionIssueSelectCode;
  ProcessingResultCode?: string;
  ProcessingResultMessage?: string;
  QualificationValidity?: QualificationValidityCode;
}

function createMessageBodyInterface(spec: MessageBodyCreationSpec): MessageBodyInterface {
  return {
    ProcessingResultStatus: spec.ProcessingResultStatus ?? processingResultStatusFromLabel("正常終了"),
    ResultList: (spec.ResultList || [{}]).map(createResultOfQualificationConfirmationInterface),
    QualificationConfirmSearchInfo: spec.QualificationConfirmSearchInfo,
    PrescriptionIssueSelect: spec.PrescriptionIssueSelect ?? prescriptionIssueSelectFromLabel("紙の処方箋"),
    ProcessingResultCode: spec.ProcessingResultCode,
    ProcessingResultMessage: spec.ProcessingResultMessage,
    QualificationValidity: spec.QualificationValidity ?? qualificationValidityFromLabel("有効"),
  };
}

function resolveDate(src: string | Date | undefined, defaultValue: () => Date): string {
  if (src === undefined) {
    src = defaultValue();
  }
  if (src instanceof Date) {
    src = dateToSqlDate(src);
  }
  const r = fromSqlDate(src);
  // console.log("resolveDate", src, r);
  return r;
}

function resolveOptDate(src: string | Date | undefined): string | undefined {
  if (src === undefined) {
    return undefined;
  }
  if (src instanceof Date) {
    src = dateToSqlDate(src);
  }
  if (src === "0000-00-00") {
    return undefined;
  }
  return fromSqlDate(src);
}

function resolveOptDateTime(src: string | Date | undefined): string | undefined {
  if (src === undefined) {
    return undefined;
  }
  if (src instanceof Date) {
    src = dateToSqlDateTime(src);
  }
  return fromSqlDateTime(src);
}

function toOptContributionRatio(src: 10 | 20 | 30 | undefined): string | undefined {
  if (src === undefined) {
    return undefined;
  } else {
    return `0${src}`;
  }
}

export interface ElderlyRecipientCertificateInfoCreationSpec {
  ElderlyRecipientCertificateDate?: string;
  ElderlyRecipientValidStartDate?: string;
  ElderlyRecipientValidEndDate?: string;
  ElderlyRecipientContributionRatio?: 10 | 20 | 30 | undefined;
}

export function createElderlyRecipientCertificateInfoInterface(spec: ElderlyRecipientCertificateInfoCreationSpec)
  : ElderlyRecipientCertificateInfoInterface {
  return {
    ElderlyRecipientCertificateDate: spec.ElderlyRecipientCertificateDate,
    ElderlyRecipientValidStartDate: spec.ElderlyRecipientCertificateDate,
    ElderlyRecipientValidEndDate: spec.ElderlyRecipientValidEndDate,
    ElderlyRecipientContributionRatio: toOptContributionRatio(spec.ElderlyRecipientContributionRatio)
  }
}

export interface ResultOfQualificationConfirmationCreationSpec {
  InsuredCardClassification?: InsuredCardClassificationCode;
  Name?: string;
  Sex1?: SexCode;
  Birthdate?: string | Date;
  InsurerName?: string;
  InsurerNumber?: string;
  InsuredCardSymbol?: string;
  InsuredIdentificationNumber?: string;
  InsuredBranchNumber?: string;
  PersonalFamilyClassification?: PersonalFamilyClassificationCode;
  InsuredName?: string; // 世帯主名
  NameOfOther?: string;
  NameKana?: string;
  NameOfOtherKana?: string;
  Sex2?: SexCode;
  Address?: string;
  PostNumber?: string;
  InsuredCertificateIssuanceDate?: string | Date;
  InsuredCardValidDate?: string | Date;
  InsuredCardExpirationDate?: string | Date;
  InsuredPartialContributionRatio?: 10 | 20 | 30 | undefined;
  PreschoolClassification?: PreschoolClassificationCode;
  ReasonOfLoss?: ReasonOfLossCode;
  ElderlyRecipientCertificateInfo?: ElderlyRecipientCertificateInfoCreationSpec;
  LimitApplicationCertificateRelatedConsFlg?: LimitApplicationCertificateRelatedConsFlgCode;
  LimitApplicationCertificateRelatedConsTime?: string | Date;
  LimitApplicationCertificateRelatedInfo?: LimitApplicationCertificateRelatedInfoInterface;
  SpecificDiseasesCertificateRelatedConsFlg?: SpecificDiseasesCertificateRelatedConsFlgCode;
  SpecificDiseasesCertificateRelatedConsTime?: string | Date;
  SpecificDiseasesCertificateList?: SpecificDiseasesCertificateInfoInterface[],
}

export function createResultOfQualificationConfirmationInterface(spec: ResultOfQualificationConfirmationCreationSpec)
  : ResultOfQualificationConfirmationInterface {
  return {
    InsuredCardClassification: spec.InsuredCardClassification ?? insuredCardClassificationFromLabel("被保険者証（一般）"),
    Name: spec.Name ?? "診療　太郎",
    Sex1: spec.Sex1 ?? sexFromLabel("男"),
    Birthdate: resolveDate(spec.Birthdate, () => new Date(1970, 7 - 1, 12)),
    InsurerName: spec.InsurerName ?? "杉並区",
    InsurerNumber: spec.InsurerNumber ?? "01123456",
    InsuredCardSymbol: spec.InsuredCardSymbol,
    InsuredIdentificationNumber: spec.InsuredIdentificationNumber,
    InsuredBranchNumber: spec.InsuredBranchNumber,
    PersonalFamilyClassification: spec.PersonalFamilyClassification,
    InsuredName: spec.InsuredName,
    NameOfOther: spec.NameOfOther,
    NameKana: spec.NameKana,
    NameOfOtherKana: spec.NameOfOtherKana,
    Sex2: spec.Sex2,
    Address: spec.Address,
    PostNumber: spec.PostNumber,
    InsuredCertificateIssuanceDate: resolveOptDate(spec.InsuredCertificateIssuanceDate),
    InsuredCardValidDate: resolveOptDate(spec.InsuredCardValidDate),
    InsuredCardExpirationDate: resolveOptDate(spec.InsuredCardExpirationDate),
    InsuredPartialContributionRatio: toOptContributionRatio(spec.InsuredPartialContributionRatio),
    PreschoolClassification: spec.PreschoolClassification,
    ReasonOfLoss: spec.ReasonOfLoss,
    ElderlyRecipientCertificateInfo: spec.ElderlyRecipientCertificateInfo
      ? createElderlyRecipientCertificateInfoInterface(spec.ElderlyRecipientCertificateInfo)
      : undefined,
    LimitApplicationCertificateRelatedConsFlg: spec.LimitApplicationCertificateRelatedConsFlg,
    LimitApplicationCertificateRelatedConsTime: resolveOptDateTime(spec.LimitApplicationCertificateRelatedConsTime),
    LimitApplicationCertificateRelatedInfo: spec.LimitApplicationCertificateRelatedInfo,
    SpecificDiseasesCertificateRelatedConsFlg: spec.SpecificDiseasesCertificateRelatedConsFlg,
    SpecificDiseasesCertificateRelatedConsTime: resolveOptDateTime(spec.SpecificDiseasesCertificateRelatedConsTime),
    SpecificDiseasesCertificateList: spec.SpecificDiseasesCertificateList ?? [],
  }
}

type OnshiHeaderModifier = (header: MessageHeaderCreationSpec) => MessageHeaderCreationSpec | void;
type OnshiBodyModifier = (body: MessageBodyCreationSpec) => MessageBodyCreationSpec | void;
type OnshiResultModifier = (result: ResultOfQualificationConfirmationCreationSpec) => ResultOfQualificationConfirmationCreationSpec | void;

function convertShahokokuhoKourei(koureiStore: number): 10 | 20 | 30 | undefined {
  if (koureiStore === 0) {
    return undefined;
  } else if (koureiStore === 1) {
    return 10;
  } else if (koureiStore === 2) {
    return 20;
  } else if (koureiStore === 3) {
    return 30;
  } else {
    throw new Error("Cannot convert koureiStore: " + koureiStore);
  }
}

function ensureSingleResult(body: MessageBodyCreationSpec): ResultOfQualificationConfirmationCreationSpec {
  let r: ResultOfQualificationConfirmationCreationSpec;
  if (!body.ResultList) {
    r = {};
    body.ResultList = [r];
  } else if (body.ResultList.length === 1) {
    r = body.ResultList[0];
  } else {
    throw new Error("multiple result list");
  }
  return r;
}

export const onshiCreationModifier = {
  patient: (p: Patient) => onshiCreationModifier.result(r => Object.assign(r, {
    Name: `${p.lastName}　${p.firstName}`,
    NameKana: `${p.lastNameYomi} ${p.firstNameYomi}`,
    Birthdate: p.birthday,
    Sex1: p.sex === "M" ? sexFromLabel("男") : sexFromLabel("女"),
  })),
  result: (m: OnshiResultModifier) => (body: MessageBodyCreationSpec) => {
    let r: ResultOfQualificationConfirmationCreationSpec = ensureSingleResult(body);
    if( body.ResultList && body.ResultList.length === 1 ){
      body.ResultList[0] = m(r) ?? r;
    } else {
      throw new Error("Cannot happen (modifier: result");
    }
    return body;
  },
  shahokokuho: (shahokokuho: Shahokokuho) => onshiCreationModifier.result(r => Object.assign(r, {
    InsurerNumber: shahokokuho.hokenshaBangou.toString(),
    InsuredCardSymbol: shahokokuho.hihokenshaKigou,
    InsuredIdentificationNumber: shahokokuho.hihokenshaBangou,
    InsuredBranchNumber: shahokokuho.edaban,
    PersonalFamilyClassification: shahokokuho.honninStore === 0
      ? personalFamilyClassificationFromLabel("家族")
      : personalFamilyClassificationFromLabel("本人"),
    InsuredCertificateIssuanceDate: shahokokuho.validFrom,
    InsuredCardValidDate: shahokokuho.validFrom,
    InsuredCardExpirationDate: shahokokuho.validUpto,
    ElderlyRecipientCertificateInfo: convertShahokokuhoKourei(shahokokuho.koureiStore),
  })),
};

export function createOnshiResultWithHeader(headerModifier: OnshiHeaderModifier, ...bodyModifiers: OnshiBodyModifier[]): OnshiResult {
  let headerSpec: MessageHeaderCreationSpec = {};
  let bodySpec: MessageBodyCreationSpec = {};
  headerSpec = headerModifier(headerSpec) ?? headerSpec;
  bodyModifiers.forEach(m => bodySpec = m(bodySpec) ?? bodySpec);

  const header = createMessageHeaderInterface(headerSpec);
  const body = createMessageBodyInterface(bodySpec);
  return OnshiResult.create(header, body);
}

export function createOnshiResult(...bodyModifiers: OnshiBodyModifier[]): OnshiResult {
  return createOnshiResultWithHeader(h => h, ...bodyModifiers);
}

export function mockOnshiSuccessResult(q: OnshiKakuninQuery): OnshiResult {
  return createOnshiResultWithHeader((h: MessageHeaderCreationSpec) => {
    h.QualificationConfirmationDate = q.confirmationDate;
  },
    onshiCreationModifier.result(r => Object.assign(r, {
      InsurerNumber: q.hokensha,
      InsuredCardSymbol: q.kigou,
      InsuredIdentificationNumber: q.hihokensha,
      InsuredBranchNumber: q.edaban,
      LimitApplicationCertificateRelatedConsFlg: q.limitAppConsFlag,
    }))
  );
}

