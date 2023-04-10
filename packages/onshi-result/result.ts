import { MessageHeader, MessageHeaderInterface } from "./MessageHeader";
import { MessageBody, MessageBodyInterface } from "./MessageBody";
import { ResultOfQualificationConfirmation } from "./ResultOfQualificationConfirmation";
import { XmlMsg, XmlMsgInterface } from "XmlMsg";
import { ResultItem } from "ResultItem";


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
    if( this.messageBody.processingResultStatus === "正常終了" ) {
      const validity = this.messageBody.qualificationValidity;
      return validity !== undefined  && validity === "有効";
    }
    return false;
  }

  get resultList(): ResultItem[] {
    return this.messageBody.resultList;
  }

  toJSON(): object {
    return this.orig;
  }

  static isOnshiResultInterface(arg: any): arg is OnshiResultInterface {
    if( typeof arg === "object" ){
      return XmlMsg.isXmlMsgInterface(arg.XmlMsg);
    } else {
      return false;
    }
  }

  static cast(arg: any): OnshiResult {
    if( this.isOnshiResultInterface(arg) ){
      return new OnshiResult(arg);
    } else {
      throw new Error("Cannot create OnshiResult");
    }
  }

  static create(header: MessageHeaderInterface, body: MessageBodyInterface): OnshiResult {
    return new OnshiResult({ XmlMsg: { MessageHeader: header, MessageBody: body }});
  }
}