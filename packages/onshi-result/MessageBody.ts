import { castOptConvert, castOptStringProp, castOptTest, castStringProp } from "./cast";
import { QualificationConfirmSearchInfo, type QualificationConfirmSearchInfoInterface } from "./QualificationConfirmSearchInfo";
import { isPrescriptionIssueSelectCode, isProcessingResultStatusCode, isQualificationValidityCode, PrescriptionIssueSelect, type PrescriptionIssueSelectLabel, ProcessingResultStatus, type ProcessingResultStatusLabel, QualificationValidity, type QualificationValidityLabel } from "./codes";
import { ResultItem, type ResultItemInterface } from "./ResultItem";
import { quiet } from "./config";

export interface MessageBodyInterface {
  ProcessingResultStatus: string;
  ResultList: ResultItemInterface[];
  QualificationConfirmSearchInfo: QualificationConfirmSearchInfoInterface | undefined;
  PrescriptionIssueSelect: string | undefined;
  ProcessingResultCode: string | undefined;
  ProcessingResultMessage: string | undefined;
  QualificationValidity: string | undefined;
}

export class MessageBody {
  orig: MessageBodyInterface;
  // 資格確認結果のリスト
  resultList: ResultItem[];
  // 資格確認照会用情報
  qualificationConfirmSearchInfo: QualificationConfirmSearchInfo | undefined;

  constructor(arg: MessageBodyInterface) {
    this.orig = arg;
    this.resultList = arg.ResultList?.map(ResultItem.cast) ?? [];
    this.qualificationConfirmSearchInfo = castOptConvert(
      arg.QualificationConfirmSearchInfo,
      QualificationConfirmSearchInfo.cast
    );
  }

  get qualificationValidity(): QualificationValidityLabel | undefined {
    const k: string | undefined = this.orig.QualificationValidity;
    if (k == undefined) {
      return undefined;
    } else if (isQualificationValidityCode(k)) {
      return QualificationValidity[k];
    } else {
      throw new Error("Invalid QualificationValidity: " + k);
    }
  }

  // 個人単位でオンライン資格確認システムの処理結果を表す区分
  get processingResultStatus(): ProcessingResultStatusLabel {
    const k: string = this.orig.ProcessingResultStatus;
    if (isProcessingResultStatusCode(k)) {
      return ProcessingResultStatus[k];
    } else {
      throw new Error("Invalid ProcessingResultStatus: " + k);
    }
  }

  // 患者が選択した処方箋の発行形態
  get prescriptionIssueSelect(): PrescriptionIssueSelectLabel | undefined {
    const k: string | undefined = this.orig.PrescriptionIssueSelect;
    if (k == undefined) {
      return undefined;
    } else if (isPrescriptionIssueSelectCode(k)) {
      return PrescriptionIssueSelect[k];
    } else {
      throw new Error("Invalid PrescriptionIssueSelect: " + k);
    }
  }

  // 最初の資格確認結果（もしあれば）
  get qualificationConfirmation(): ResultItem | undefined {
    return this.resultList[0];
  }

  // 処理結果状況がエラーを示す場合、エラー内容に準ずるコードを返却する。
  // 正常処理を示すコードが設定された場合は、処理状況に付帯情報が存
  // 在する時のみコードを返却する。（例：マイナンバーカードの失効期限3か
  // 月前）
  get processingResultCode(): string | undefined {
    return this.orig.ProcessingResultCode;
  }

  // 処理結果メッセージ
  get processingResultMessage(): string | undefined {
    return this.orig.ProcessingResultMessage;
  }

  // 患者氏名
  get name(): string {
    const resultOpt = this.resultList[0];
    if (resultOpt != undefined) {
      return resultOpt.name;
    } else {
      return "";
    }
  }

  // 患者氏名よみ
  get nameKana(): string | undefined {
    const resultOpt = this.resultList[0];
    if (resultOpt != undefined) {
      return resultOpt.nameKana;
    } else {
      return "";
    }
  }

  toJSON(): object {
    return this.orig;
  }

  static isMessageBodyInterface(arg: any): arg is MessageBody {
    if (typeof arg === "object") {
      const ok = castStringProp(arg, "ProcessingResultStatus") &&
        (Array.isArray(arg.ResultList) && arg.ResultList.every(
          ResultItem.isResultItemInterface
        ) || !arg.ResultList)
        && castOptTest(
          arg.QualificationConfirmSearchInfo,
          QualificationConfirmSearchInfo.isQualificationConfirmSearchInfoInterface
        ) &&
        castOptStringProp(arg, "PrescriptionIssueSelect") &&
        castOptStringProp(arg, "ProcessingResultCode") &&
        castOptStringProp(arg, "ProcessingResultMessage") &&
        castOptStringProp(arg, "QualificationValidity");
      if( !ok ){
        console.error("isMessageBodyInterface failed");
        console.log("arg", arg);
        console.log("isArray", arg.ResultList, " - ", Array.isArray(arg.ResultList));
        console.log("every", arg.ResultList.every(
          ResultItem.isResultItemInterface
        ));
      }
      return ok;
    } else {
      if( !quiet ){
        console.error("is not object (isMessageBodyInterface)");
      }
      return false;
    }
  }
}

