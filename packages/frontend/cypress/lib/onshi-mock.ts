import type { OnshiKakuninQuery } from "@/lib/onshi-confirm";
import { OnshiResult } from "onshi-result";
import { MessageBody, type MessageBodyInterface } from "onshi-result/MessageBody";
import { MessageHeader, type MessageHeaderInterface } from "onshi-result/MessageHeader";
import { XmlMsg } from "onshi-result/XmlMsg";
import { fromSqlDateTime, fromSqlDate } from "onshi-result/util";
import { dateToSqlDate, dateToSqlDateTime } from "myclinic-model";
import { ResultOfQualificationConfirmation, type ResultOfQualificationConfirmationInterface } from "onshi-result/ResultOfQualificationConfirmation";

function messageHeaderBase(): MessageHeaderInterface {
  return {
    ProcessExecutionTime: fromSqlDateTime(dateToSqlDateTime(new Date())),
    QualificationConfirmationDate: fromSqlDate(dateToSqlDate(new Date())),
    MedicalInstitutionCode: "1234567",
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
    SpecificDiseasesCertificateList: [], //SpecificDiseasesCertificateInfo[]
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