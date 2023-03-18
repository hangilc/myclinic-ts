import { castOptStringProp, castStringProp } from "./cast";
import { ResultOfQualificationConfirmation } from "./ResultOfQualificationConfirmation";
import { QualificationConfirmSearchInfo } from "./QualificationConfirmSearchInfo";
import { SpecificDiseasesCertificateInfo } from "./SpecificDiseasesCertificateInfo";
import { isPrescriptionIssueSelectCode, isProcessingResultStatusCode, isQualificationValidityCode, PrescriptionIssueSelect, PrescriptionIssueSelectLabel, ProcessingResultStatus, ProcessingResultStatusLabel, QualificationValidity, QualificationValidityLabel } from "./codes";

interface MessageBodyInterface {
  ProcessingResultStatus: string;
  ResultList: ResultOfQualificationConfirmation[];
  QualificationConfirmSearchInfo: QualificationConfirmSearchInfo | undefined;
  PrescriptionIssueSelect: string | undefined;
  ProcessingResultCode: string | undefined;
  ProcessingResultMessage: string | undefined;
  QualificationValidity: string | undefined;
  SpecificDiseasesCertificateList: SpecificDiseasesCertificateInfo[]
}

export class MessageBody {
  orig: MessageBodyInterface;

  constructor(arg: MessageBodyInterface) {
    this.orig = arg;
  }

  get qualificationValidity(): QualificationValidityLabel | undefined {
    const k: string | undefined = this.orig.QualificationValidity;
    if( k == undefined ){
      return undefined;
    } else if( isQualificationValidityCode(k) ){
      return QualificationValidity[k];
    } else {
      throw new Error("Invalid QualificationValidity: " + k);
    }
  }

  // 個人単位でオンライン資格確認システムの処理結果を表す区分
  get processingResultStatus(): ProcessingResultStatusLabel {
    const k: string = this.orig.ProcessingResultStatus;
    if( isProcessingResultStatusCode(k) ){
      return ProcessingResultStatus[k];
    } else {
      throw new Error("Invalid ProcessingResultStatus: " + k);
    }
  }

  // 資格確認結果のリスト
  get resultList(): ResultOfQualificationConfirmation[] {
    return this.orig.ResultList;
  }

  // 資格確認照会用情報
  get qualificationConfirmSearchInfo(): QualificationConfirmSearchInfo | undefined {
    return this.orig.QualificationConfirmSearchInfo;
  }

  // 患者が選択した処方箋の発行形態
  get prescriptionIssueSelect(): PrescriptionIssueSelectLabel | undefined {
    const k: string | undefined = this.orig.PrescriptionIssueSelect;
    if( k == undefined ){
      return undefined;
    } else if( isPrescriptionIssueSelectCode(k) ){
      return PrescriptionIssueSelect[k];
    } else {
      throw new Error("Invalid PrescriptionIssueSelect: " + k);
    }
  }

  // 最初の資格確認結果（もしあれば）
  get qualificationConfirmation(): ResultOfQualificationConfirmation | undefined {
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
    if( resultOpt != undefined ){
      return resultOpt.name;
    } else {
      return "";
    }
  }

  // 患者氏名よみ
  get nameKana(): string | undefined {
    const resultOpt = this.resultList[0];
    if( resultOpt != undefined ){
      return resultOpt.nameKana;
    } else {
      return "";
    }
  }

  static cast(arg: any): MessageBody {
    if (typeof arg === "object") {
      return new MessageBody({
        ProcessingResultStatus: castStringProp(arg, "ProcessingResultStatus"),
        ResultList: castResultList(arg.ResultList),
        QualificationConfirmSearchInfo:
          castQualificationConfirmSearchInfo(arg.QualificationConfirmSearchInfo),
        PrescriptionIssueSelect: castOptStringProp(arg, "PrescriptionIssueSelect"),
        ProcessingResultCode: castOptStringProp(arg, "ProcessingResultCode"),
        ProcessingResultMessage: castOptStringProp(arg, "ProcessingResultMessage"),
        QualificationValidity: castOptStringProp(arg, "QualificationValidity"),
        SpecificDiseasesCertificateList: castSpecificDiseasesCertificateInfo(arg.SpecificDiseasesCertificateList),
      });
    } else {
      throw new Error("Object expected: " + arg);
    }
  }
}

function castResultList(arg: any): ResultOfQualificationConfirmation[] {
  if (arg == undefined) {
    return [];
  } else if (Array.isArray(arg)) {
    return arg.map(e => ResultOfQualificationConfirmation.cast(e.ResultOfQualificationConfirmation));
  } else {
    throw new Error("Array or undefined expected: " + arg);
  }
}

function castQualificationConfirmSearchInfo(arg: any): QualificationConfirmSearchInfo | undefined {
  if (arg == undefined) {
    return undefined;
  } else {
    return QualificationConfirmSearchInfo.cast(arg);
  }
}
function castSpecificDiseasesCertificateInfo(arg: any): SpecificDiseasesCertificateInfo[] {
  if (arg == undefined) {
    return [];
  } else if (Array.isArray(arg)) {
    return arg.map(e => SpecificDiseasesCertificateInfo.cast(e));
  } else {
    throw new Error("Cannot convert to SpecificDiseasesCertificateList: " + arg);
  }
}