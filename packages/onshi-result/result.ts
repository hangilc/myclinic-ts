import { MessageHeader, MessageHeaderInterface } from "./MessageHeader";
import { MessageBody, MessageBodyInterface } from "./MessageBody";
import { XmlMsg, XmlMsgInterface } from "./XmlMsg";
import { ResultItem } from "./ResultItem";
import { quiet } from "./config";
export { setQuiet } from "./config";

export interface OnshiResultInterface {
  XmlMsg: XmlMsgInterface;
}

export class OnshiResult {
  orig: OnshiResultInterface;
  xmlMsg: XmlMsg;

  constructor(orig: OnshiResultInterface) {
    this.orig = orig;
    this.xmlMsg = new XmlMsg(orig.XmlMsg);
  }

  get messageHeader(): MessageHeader {
    return this.xmlMsg.messageHeader;
  }

  get messageBody(): MessageBody {
    return this.xmlMsg.messageBody;
  }

  // 資格が確認できたかどうか
  get isValid(): boolean {
    return this.messageHeader.segmentOfResult === "正常終了" &&
      this.messageBody.processingResultStatus === "正常終了" &&
      this.messageBody.qualificationValidity === "有効" &&
      this.messageBody.resultList.length === 1;
    // if (this.messageBody.processingResultStatus === "正常終了") {
    //   const validity = this.messageBody.qualificationValidity;
    //   return validity !== undefined && validity === "有効";
    // }
    // return false;
  }

  getErrorMessage(): string {
    try {
      const list: string[] = [];
      if( this.messageHeader.segmentOfResult !== "正常終了" ){
        list.push(this.messageHeader.segmentOfResult)
      }
      if( this.messageHeader.errorMessage ){
        list.push(this.messageHeader.errorMessage);
      }
      if( this.messageBody.qualificationValidity !== "有効" ){
        if( this.messageBody.qualificationValidity ){
          list.push(this.messageBody.qualificationValidity);
        }
      }
      return list.join("");
    } catch (ex: any) {
      return ex.toString();
    }
  }

  probeKoukikourei(): number | undefined {
    if (this.resultList.length === 1) {
      const ri = this.resultList[0];
      return ri.koukikoureiFutanWari;
    } else {
      return undefined;
    }
  }

  probeKoureiJukyuu(): number | undefined {
    if (this.resultList.length === 1) {
      const ri = this.resultList[0];
      const kourei = ri.kourei;
      if (kourei) {
        return kourei.futanWari;
      }
    }
    return undefined;
  }

  get resultList(): ResultItem[] {
    return this.messageBody.resultList;
  }

  toJSON(): object {
    return this.orig;
  }

  static isOnshiResultInterface(arg: any): arg is OnshiResultInterface {
    if (typeof arg === "object") {
      return XmlMsg.isXmlMsgInterface(arg.XmlMsg);
    } else {
      if (!quiet) {
        console.error("is not object (isOnshiResultInterface)")
      }
      return false;
    }
  }

  static cast(arg: any): OnshiResult {
    if (OnshiResult.isOnshiResultInterface(arg)) {
      return new OnshiResult(arg);
    } else {
      throw new Error("Cannot create OnshiResult");
    }
  }

  static create(header: MessageHeaderInterface, body: MessageBodyInterface): OnshiResult {
    return new OnshiResult({ XmlMsg: { MessageHeader: header, MessageBody: body } });
  }
}