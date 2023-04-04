import type { OnshiKakuninQuery } from "@/lib/onshi-confirm";
import { OnshiResult } from "onshi-result";
import { MessageBody, type MessageBodyInterface } from "onshi-result/MessageBody";
import { MessageHeader, type MessageHeaderInterface } from "onshi-result/MessageHeader";
import { fromSqlDateTime, fromSqlDate } from "onshi-result/util";
import { dateToSqlDate, dateToSqlDateTime } from "myclinic-model";
import { ResultOfQualificationConfirmation, type ResultOfQualificationConfirmationInterface } from "onshi-result/ResultOfQualificationConfirmation";
import { characterCodeIdentifierFromLabel, preschoolClassificationFromLabel, prescriptionIssueSelectFromLabel, processingResultStatusFromLabel, qualificationValidityFromLabel, referenceClassificationFromLabel, segmentOfResultFromLabel, type CharacterCodeIdentifierCode, type PrescriptionIssueSelectCode, type ProcessingResultStatusCode, type QualificationValidityCode, type ReferenceClassificationCode, type SegmentOfResultCode } from "onshi-result/codes";
import type { QualificationConfirmSearchInfo, QualificationConfirmSearchInfoInterface } from "onshi-result/QualificationConfirmSearchInfo";

function messageHeaderBase(): MessageHeaderInterface {
  return {
    ProcessExecutionTime: fromSqlDateTime(dateToSqlDateTime(new Date())),
    QualificationConfirmationDate: fromSqlDate(dateToSqlDate(new Date())),
    MedicalInstitutionCode: "1312345678",
    ReferenceClassification: "2", // 保険者証
    CharacterCodeIdentifier: "0", // UTF-8
    SegmentOfResult: "1", // 正常終了
    ArbitraryFileIdentifier: undefined,
    ErrorCode: undefined,
    ErrorMessage: undefined,
  };
}

function messageBodyBase(): MessageBodyInterface {
  return {
    ProcessingResultStatus: "1", // 正常終了
    ResultList: [], //ResultOfQualificationConfirmation[];
    QualificationConfirmSearchInfo: undefined,
    PrescriptionIssueSelect: undefined,
    ProcessingResultCode: undefined,
    ProcessingResultMessage: undefined,
    QualificationValidity: "1", // 有効
  };
}

function resultBase(): ResultOfQualificationConfirmationInterface {
  return {
    InsuredCardClassification: "01", // 被保険者証（一般） 
    Name: "診療 太郎",
    Sex1: "1", // 男,
    Birthdate: "20000101",
    InsurerName: "保険組合",
    InsurerNumber: undefined,
    InsuredCardSymbol: undefined,
    InsuredIdentificationNumber: undefined,
    InsuredBranchNumber: undefined,
    PersonalFamilyClassification: undefined,
    InsuredName: undefined,
    NameOfOther: undefined,
    NameKana: undefined,
    NameOfOtherKana: undefined,
    Sex2: undefined,
    Address: undefined,
    PostNumber: undefined,
    InsuredCertificateIssuanceDate: undefined,
    InsuredCardValidDate: undefined,
    InsuredCardExpirationDate: undefined,
    InsuredPartialContributionRatio: undefined,
    PreschoolClassification: undefined,
    ReasonOfLoss: undefined,
    ElderlyRecipientCertificateInfo: undefined,
    LimitApplicationCertificateRelatedConsFlg: undefined,
    LimitApplicationCertificateRelatedConsTime: undefined,
    LimitApplicationCertificateRelatedInfo: undefined,
    SpecificDiseasesCertificateRelatedConsFlg: undefined,
    SpecificDiseasesCertificateRelatedConsTime: undefined,
    SpecificDiseasesCertificateList: [],
  }
}

export function mockOnshiSuccessResult(q: OnshiKakuninQuery): OnshiResult {
  const messageHeader = new MessageHeader(Object.assign(messageHeaderBase(), {
    QualificationConfirmationDate: fromSqlDate(q.confirmationDate)
  }));
  const messageBody = new MessageBody(Object.assign(messageBodyBase(), {
    ResultList: [
      new ResultOfQualificationConfirmation(Object.assign(resultBase(), {
        InsurerNumber: q.hokensha,
        InsuredCardSymbol: q.kigou,
        InsuredIdentificationNumber: q.hihokensha,
        InsuredBranchNumber: q.edaban,
        LimitApplicationCertificateRelatedConsFlg: q.limitAppConsFlag,
      }))
    ]
  }));
  const xmlMsg = new XmlMsg(messageHeader, messageBody);
  const origJson: object = {
    XmlMsg: xmlMsg.toJsonObject()
  }
  return new OnshiResult(xmlMsg, origJson);
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
  ResultList?: ResultOfQualificationConfirmationInterface[];
  QualificationConfirmSearchInfo?: QualificationConfirmSearchInfoInterface;
  PrescriptionIssueSelect?: PrescriptionIssueSelectCode;
  ProcessingResultCode?: string;
  ProcessingResultMessage?: string;
  QualificationValidity?: QualificationValidityCode;
}

function createMessageBodyInterface(spec: MessageBodyCreationSpec): MessageBodyInterface {
  return {
    ProcessingResultStatus: spec.ProcessingResultStatus ?? processingResultStatusFromLabel("正常終了"),
    ResultList: spec.ResultList ?? [],
    QualificationConfirmSearchInfo: spec.QualificationConfirmSearchInfo,
    PrescriptionIssueSelect: spec.PrescriptionIssueSelect ?? prescriptionIssueSelectFromLabel("紙の処方箋"),
    ProcessingResultCode: spec.ProcessingResultCode,
    ProcessingResultMessage: spec.ProcessingResultMessage,
    QualificationValidity: spec.QualificationValidity ?? qualificationValidityFromLabel("有効"),
  };
}

export interface ResultOfQualificationConfirmationCreationSpec {

}

function createResultOfQualificationConfirmationInterface(spec: ResultOfQualificationConfirmationCreationSpec)
  : ResultOfQualificationConfirmationInterface {
  return {
    InsuredCardClassification: string;
    Name: string;
    Sex1: string;
    Birthdate: string;
    InsurerName: string;
    InsurerNumber: string | undefined;
    InsuredCardSymbol: string | undefined;
    InsuredIdentificationNumber: string | undefined;
    InsuredBranchNumber: string | undefined;
    PersonalFamilyClassification: string | undefined;
    InsuredName: string | undefined;
    NameOfOther: string | undefined;
    NameKana: string | undefined;
    NameOfOtherKana: string | undefined;
    Sex2: string | undefined;
    Address: string | undefined;
    PostNumber: string | undefined;
    InsuredCertificateIssuanceDate: string | undefined;
    InsuredCardValidDate: string | undefined;
    InsuredCardExpirationDate: string | undefined;
    InsuredPartialContributionRatio: string | undefined;
    PreschoolClassification: string | undefined;
    ReasonOfLoss: string | undefined;
    ElderlyRecipientCertificateInfo: ElderlyRecipientCertificateInfoInterface | undefined;
    LimitApplicationCertificateRelatedConsFlg: string | undefined;
    LimitApplicationCertificateRelatedConsTime: string | undefined;
    LimitApplicationCertificateRelatedInfo: LimitApplicationCertificateRelatedInfoInterface | undefined;
    SpecificDiseasesCertificateRelatedConsFlg: string | undefined;
    SpecificDiseasesCertificateRelatedConsTime: string | undefined;
    SpecificDiseasesCertificateList: SpecificDiseasesCertificateInfoInterface[];
  }
}

export function createOnshiResult(headerSpec: MessageHeaderCreationSpec, bodySpec: MessageBodyCreationSpec): OnshiResult {
  const header: MessageHeaderInterface = createMessageHeaderInterface(headerSpec);
  const body: MessageBodyInterface = createMessageBodyInterface(bodySpec);
  return OnshiResult.create(header, body);
}