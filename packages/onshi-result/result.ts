import { MessageHeader, MessageHeaderInterface } from "./MessageHeader";
import { MessageBody, MessageBodyInterface } from "./MessageBody";
import { ResultOfQualificationConfirmation } from "./ResultOfQualificationConfirmation";

export interface XmlMsgInterface {
  MessageHeader: MessageHeaderInterface;
  MessageBody: MessageBodyInterface;
}

export interface OnshiResultInterface {
  XmlMsg: XmlMsgInterface;
}

export class OnshiResult {
  orig: object;
  messageHeader: MessageHeader;
  messageBody: MessageBody;

  constructor(orig: OnshiResultInterface) {
    this.orig = orig;
    this.messageHeader = MessageHeader.cast(orig.XmlMsg.MessageHeader);
    console.log("header", this.messageHeader);
    this.messageBody = MessageBody.cast(orig.XmlMsg.MessageBody);
    console.log("body", this.messageBody);
  }

  // 資格が確認できたかどうか
  get isValid(): boolean {
    if( this.messageBody.processingResultStatus === "正常終了" ) {
      const validity = this.messageBody.qualificationValidity;
      return validity !== undefined  && validity === "有効";
    }
    return false;
  }

  get resultList(): ResultOfQualificationConfirmation[] {
    return this.messageBody.resultList;
  }

  toJSON(): object {
    return this.orig;
  }

  static cast(arg: any): OnshiResult {
    if( typeof arg === "object" ){
      if( typeof arg.XmlMsg === "object" ){
        return new OnshiResult(arg);
      } else {
        throw new Error("object expected (XmlMsg)");
      }
    } else {
      throw new Error("object expected (OnshiResult.cast)");
    }
  }

  static create(header: MessageHeaderInterface, body: MessageBodyInterface): OnshiResult {
    return OnshiResult.cast({ XmlMsg: { MessageHeader: header, MessageBody: body }});
  }
}