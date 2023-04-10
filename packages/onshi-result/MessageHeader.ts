import { onshiDateToSqlDate, onshiDateTimeToSqlDateTime } from "./util";
import { castOptStringProp, castStringProp } from "./cast";
import { type ReferenceClassificationLabel, ReferenceClassification, type SegmentOfResultLabel, SegmentOfResult, isReferenceClassificationCode, isSegmentOfResultCode, type CharacterCodeIdentifierLabel, isCharacterCodeIdentifierCode, CharacterCodeIdentifier } from "./codes";

export interface MessageHeaderInterface {
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
  orig: MessageHeaderInterface

  constructor(arg: MessageHeaderInterface) {
    this.orig = arg;
  }

  // オンライン資格確認システムにて処理が実行された日時 (YYYY-MM-DD HH:mm:ss)
  get processExecutionTime(): string {
    return onshiDateTimeToSqlDateTime(this.orig.ProcessExecutionTime);
  }

  // 保険資格を確認する日付
  get qualificationConfirmationDate(): string {
    return onshiDateToSqlDate(this.orig.QualificationConfirmationDate);
  }

  // 保険医療機関について定められた10桁のコード
  get medicalInstitutionCode(): string {
    return this.orig.MedicalInstitutionCode;
  }

  // 医療機関ごとに使用できる項目（使用は任意）
  get arbitraryFileIdentifier(): string {
    return this.orig.ArbitraryFileIdentifier ?? "";
  }

  // 患者の提示した券情報の区分
  get referenceClassification(): ReferenceClassificationLabel {
    const k: string = this.orig.ReferenceClassification;
    if (isReferenceClassificationCode(k)) {
      return ReferenceClassification[k];
    } else {
      throw new Error("Invalid ReferenceClassification value: " + k);
    }
  }

  // 処理結果区分
  get segmentOfResult(): SegmentOfResultLabel {
    const k = this.orig.SegmentOfResult;
    if (isSegmentOfResultCode(k)) {
      return SegmentOfResult[k];
    } else {
      throw new Error("Invalid SegmentOfResult value: " + k);
    }
  }

  // 処理結果区分が正常終了以外を示す場合、エラー内容に準ずるコードを設定する。
  get errorCode(): string | undefined {
    return this.orig.ErrorCode;
  }

  // 処理結果区分が正常終了以外を示す場合、エラー内容を設定する。 
  get errorMessage(): string | undefined {
    return this.orig.ErrorMessage;
  }

  // 結果ファイル出力用の文字コードを指定する識別コード
  get characterCodeIdentifier(): CharacterCodeIdentifierLabel {
    const k: string = this.orig.CharacterCodeIdentifier;
    if (isCharacterCodeIdentifierCode(k)) {
      return CharacterCodeIdentifier[k];
    } else {
      throw new Error("Invalid CharacterCodeIdentifier: " + k);
    }
  }

  toJSON(): object {
    return this.orig;
  }

  static isMessageHeaderInterface(arg: any): arg is MessageHeader {
    if (typeof arg === "object") {
      return castStringProp(arg, "ProcessExecutionTime") &&
        castStringProp(arg, "QualificationConfirmationDate") &&
        castStringProp(arg, "MedicalInstitutionCode") &&
        castOptStringProp(arg, "ArbitraryFileIdentifier") &&
        castStringProp(arg, "ReferenceClassification") &&
        castStringProp(arg, "SegmentOfResult") &&
        castOptStringProp(arg, "ErrorCode") &&
        castOptStringProp(arg, "ErrorMessage") &&
        castStringProp(arg, "CharacterCodeIdentifier");
    } else {
      return false;
    }
  }
}