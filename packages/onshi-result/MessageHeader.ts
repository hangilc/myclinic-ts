import { toSqlDate, toSqlDateTime } from "./util";
import { castOptStringProp, castStringProp } from "./cast";
import { ReferenceClassificationLabel, ReferenceClassification, SegmentOfResultLabel, SegmentOfResult } from "./codes";

interface MessageHeaderInterface {
  ProcessExecutionTime: string;
  QualificationConfirmationDate: string;
  MedicalInstitutionCode: string;
  ArbitraryFileIdentifier: string | undefined;
  ReferenceClassification: string;
  SegmentOfResult: string;
  ErrorCode: string | undefined;
  ErrorMessage: string | undefined;
  CharacterCodeIdentifier: string;
}

export class MessageHeader {
  ProcessExecutionTime: string;
  QualificationConfirmationDate: string;
  MedicalInstitutionCode: string;
  ArbitraryFileIdentifier: string | undefined;
  ReferenceClassification: string;
  SegmentOfResult: string;
  ErrorCode: string | undefined;
  ErrorMessage: string | undefined;
  CharacterCodeIdentifier: string;

  constructor(arg: MessageHeaderInterface) {
    this.ProcessExecutionTime = arg.ProcessExecutionTime;
    this.QualificationConfirmationDate = arg.QualificationConfirmationDate;
    this.MedicalInstitutionCode = arg.MedicalInstitutionCode;
    this.ArbitraryFileIdentifier = arg.ArbitraryFileIdentifier;
    this.ReferenceClassification = arg.ReferenceClassification;
    this.SegmentOfResult = arg.SegmentOfResult;
    this.ErrorCode = arg.ErrorCode;
    this.ErrorMessage = arg.ErrorMessage;
    this.CharacterCodeIdentifier = arg.CharacterCodeIdentifier;
  }

  // オンライン資格確認システムにて処理が実行された日時 (YYYY-MM-DD HH:mm:ss)
  get processExecutionTime(): string {
    return toSqlDateTime(this.ProcessExecutionTime);
  }

  // 保険資格を確認する日付
  get qualificationConfirmationDate(): string {
    return toSqlDate(this.QualificationConfirmationDate);
  }

  // 保険医療機関について定められた10桁のコード
  get medicalInstitutionCode(): string {
    return this.MedicalInstitutionCode;
  }

  // 医療機関ごとに使用できる項目（使用は任意）
  get arbitraryFileIdentifier(): string {
    return this.ArbitraryFileIdentifier ?? "";
  }

  // 患者の提示した券情報の区分
  get referenceClassification(): ReferenceClassificationLabel {
    const k: string = this.ReferenceClassification;
    if( k === "1" || k === "2" ){
      return ReferenceClassification[k];
    } else {
      throw new Error("Invalid ReferenceClassification value: " + k);
    }
  }

  // 処理結果区分
  get segmentOfResult(): SegmentOfResultLabel {
    const k = this.SegmentOfResult;
    if( k === "1" || k === "2" || k === "9") {
      return SegmentOfResult[k];
    } else {
      throw new Error("Invalid SegmentOfResult value: " + k);
    }
  }

  static cast(arg: any): MessageHeader {
    return new MessageHeader({
      ProcessExecutionTime: castStringProp(arg, "ProcessExecutionTime"),
      QualificationConfirmationDate: castStringProp(arg, "QualificationConfirmationDate"),
      MedicalInstitutionCode: castStringProp(arg, "MedicalInstitutionCode"),
      ArbitraryFileIdentifier: castOptStringProp(arg, "ArbitraryFileIdentifier"),
      ReferenceClassification: castStringProp(arg, "ReferenceClassification"),
      SegmentOfResult: castStringProp(arg, "SegmentOfResult"),
      ErrorCode: castOptStringProp(arg, "ErrorCode"),
      ErrorMessage: castOptStringProp(arg, "ErrorMessage"),
      CharacterCodeIdentifier: castStringProp(arg, "CharacterCodeIdentifier"),
    })
  }
}