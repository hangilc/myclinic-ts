import type { OnshiKakuninQuery } from "@/lib/onshi-confirm";
import { OnshiResult } from "onshi-result";
import { MessageBody, type MessageBodyInterface } from "onshi-result/MessageBody";
import { MessageHeader, type MessageHeaderInterface } from "onshi-result/MessageHeader";
import { XmlMsg } from "onshi-result/XmlMsg";
import { fromSqlDateTime, fromSqlDate } from "onshi-result/util";
import { dateToSqlDate, dateToSqlDateTime } from "myclinic-model";
import { ResultOfQualificationConfirmation, type ResultOfQualificationConfirmationInterface } from "onshi-result/ResultOfQualificationConfirmation";
import { characterCodeIdentifierFromLabel, referenceClassificationFromLabel, segmentOfResultFromLabel, type CharacterCodeIdentifierCode, type CharacterCodeIdentifierLabel, type ReferenceClassificationCode, type ReferenceClassificationLabel, type SegmentOfResultCode, type SegmentOfResultLabel } from "onshi-result/codes";

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

export interface RequiredMessageHeaderInterface {
  ProcessExecutionTime: string;
  QualificationConfirmationDate: string;
  MedicalInstitutionCode: string;
  ReferenceClassification: string;
  SegmentOfResult: string;
  CharacterCodeIdentifier: string;
}

export function createMessageHeaderInterface(
  processExecutionTime?: Date,
  qualificationConfirmationDate?: Date,
  medicalInstitutionCode?: string,
  referenceClassificationCode?: ReferenceClassificationCode,
  segmentOfResultCode?: SegmentOfResultCode,
  characterCodeIdentifierCode?: CharacterCodeIdentifierCode,
) {
  processExecutionTime = processExecutionTime ?? new Date();
  qualificationConfirmationDate = qualificationConfirmationDate ?? new Date();
  medicalInstitutionCode = medicalInstitutionCode ?? "1312345678";
  let referenceClassification: string = referenceClassificationCode
    ?? referenceClassificationFromLabel("マイナンバーカード");
  let segmentOfResult: string = segmentOfResultCode 
    ?? segmentOfResultFromLabel("正常終了");
  let characterCodeIdentifier: string = characterCodeIdentifierCode
    ?? characterCodeIdentifierFromLabel("UTF-8");
  return {
    ProcessExecutionTime: processExecutionTime,
    QualificationConfirmationDate: qualificationConfirmationDate,
    MedicalInstitutionCode: medicalInstitutionCode,
    ArbitraryFileIdentifier: undefined,
    ReferenceClassification: referenceClassification,
    SegmentOfResult: segmentOfResult,
    ErrorCode: undefined,
    ErrorMessage: undefined,
    CharacterCodeIdentifier: characterCodeIdentifier,
  }
}

export function createOnshiResult(): OnshiResult {
  const h = createMessageHeaderInterface(medicalInstitutionCode = "1234567890");
}