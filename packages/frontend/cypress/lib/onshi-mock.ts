import type { OnshiKakuninQuery } from "@/lib/onshi-confirm";
import { OnshiResult } from "onshi-result";
import type { MessageBodyInterface } from "onshi-result/MessageBody";
import type { MessageHeaderInterface } from "onshi-result/MessageHeader";
import { fromSqlDateTime, fromSqlDate } from "onshi-result/util";
import { dateToSqlDate, dateToSqlDateTime, Patient } from "myclinic-model";
import type { ResultOfQualificationConfirmationInterface } from "onshi-result/ResultOfQualificationConfirmation";
import { characterCodeIdentifierFromLabel, insuredCardClassificationFromLabel, prescriptionIssueSelectFromLabel, processingResultStatusFromLabel, qualificationValidityFromLabel, referenceClassificationFromLabel, segmentOfResultFromLabel, sexFromLabel, type CharacterCodeIdentifierCode, type InsuredCardClassificationCode, type InsuredCardClassificationLabel, type LimitApplicationCertificateRelatedConsFlgCode, type PersonalFamilyClassificationCode, type PreschoolClassificationCode, type PrescriptionIssueSelectCode, type ProcessingResultStatusCode, type QualificationValidityCode, type ReasonOfLossCode, type ReferenceClassificationCode, type SegmentOfResultCode, type SexCode, type SpecificDiseasesCertificateRelatedConsFlgCode } from "onshi-result/codes";
import type { QualificationConfirmSearchInfoInterface } from "onshi-result/QualificationConfirmSearchInfo";
import type { ElderlyRecipientCertificateInfoInterface } from "onshi-result/ElderlyRecipientCertificateInfo";
import type { LimitApplicationCertificateRelatedInfoInterface } from "onshi-result/LimitApplicationCertificateRelatedInfo";
import type { SpecificDiseasesCertificateInfoInterface } from "onshi-result/SpecificDiseasesCertificateInfo";

export function mockOnshiSuccessResult(q: OnshiKakuninQuery): OnshiResult {
  return createOnshiResult({
    QualificationConfirmationDate: q.confirmationDate,
  }, {
    ResultList: [
      {
        InsurerNumber: q.hokensha,
        InsuredCardSymbol: q.kigou,
        InsuredIdentificationNumber: q.hihokensha,
        InsuredBranchNumber: q.edaban,
        LimitApplicationCertificateRelatedConsFlg: q.limitAppConsFlag,
      }
    ]
  });
}

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
  return fromSqlDate(src);
}

function resolveOptDate(src: string | Date | undefined): string | undefined {
  if (src === undefined) {
    return undefined;
  }
  if (src instanceof Date) {
    src = dateToSqlDate(src);
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
  ElderlyRecipientCertificateInfo?: ElderlyRecipientCertificateInfoInterface;
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
    ElderlyRecipientCertificateInfo: spec.ElderlyRecipientCertificateInfo,
    LimitApplicationCertificateRelatedConsFlg: spec.LimitApplicationCertificateRelatedConsFlg,
    LimitApplicationCertificateRelatedConsTime: resolveOptDateTime(spec.LimitApplicationCertificateRelatedConsTime),
    LimitApplicationCertificateRelatedInfo: spec.LimitApplicationCertificateRelatedInfo,
    SpecificDiseasesCertificateRelatedConsFlg: spec.SpecificDiseasesCertificateRelatedConsFlg,
    SpecificDiseasesCertificateRelatedConsTime: resolveOptDateTime(spec.SpecificDiseasesCertificateRelatedConsTime),
    SpecificDiseasesCertificateList: spec.SpecificDiseasesCertificateList ?? [],
  }
}

type OnshiCreationPair = [MessageHeaderCreationSpec, MessageBodyCreationSpec];

export type OnshiCreationModifier = (specs: OnshiCreationPair) => OnshiCreationPair;

function bodyModifier(m: (spec: MessageBodyCreationSpec) => MessageBodyCreationSpec): OnshiCreationModifier {
  return (pair: OnshiCreationPair) => [ pair[0], m(pair[1]) ];
}

const onshiCreationModifier = {
  patient: (p: Patient) => bodyModifier(body => Object.assign({}, body, {
    Name: `${p.lastName}　${p.firstName}`,
    NameKana: `${p.lastNameYomi} ${p.firstNameYomi}`,
    Birthdate: p.birthday,
    Sex1: p.sex === "M" ? sexFromLabel("男") : sexFromLabel("女"),
  })),
};

export function createOnshiResult(...modifiers: OnshiCreationModifier[]): OnshiResult {
  let pair:  [MessageHeaderCreationSpec, MessageBodyCreationSpec] = [{}, {}];
  modifiers.forEach(m => pair = m(pair));

  const header = createMessageHeaderInterface(pair[0]);
  const body = createMessageBodyInterface(pair[1]);
  return OnshiResult.create(header, body);
}