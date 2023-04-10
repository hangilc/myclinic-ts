import { MessageBody, MessageBodyInterface } from "MessageBody";
import { MessageHeader, MessageHeaderInterface } from "MessageHeader";

export interface XmlMsgInterface {
  MessageHeader: MessageHeaderInterface;
  MessageBody: MessageBodyInterface;
}

export class XmlMsg {
  orig: XmlMsgInterface;
  messageHeader: MessageHeader;
  messageBody: MessageBody;

  constructor(orig: XmlMsgInterface) {
    this.orig = orig;
    this.messageHeader = new MessageHeader(orig.MessageHeader);
    this.messageBody = new MessageBody(orig.MessageBody);
  }

  toJSON(): object {
    return this.orig;
  }

  static isXmlMsgInterface(arg: any): arg is XmlMsgInterface {
    if( typeof arg === "object" ){
      return MessageHeader.isMessageHeaderInterface(arg.MessageHeader) && 
        MessageBody.isMessageBodyInterface(arg.MessageBody);
    } else {
      return false;
    }
  }
}