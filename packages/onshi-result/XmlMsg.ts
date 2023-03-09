import { MessageBody } from "./MessageBody";
import { MessageHeader } from "./MessageHeader";

export class XmlMsg {
  MessageHeader: MessageHeader;
  MessageBody: MessageBody;

  constructor(MessageHeader: MessageHeader, MessageBody: MessageBody) {
    this.MessageHeader = MessageHeader;
    this.MessageBody = MessageBody;
  }
  static cast(arg: any): XmlMsg {
    return new XmlMsg(
      MessageHeader.cast(arg.MessageHeader),
      MessageBody.cast(arg.MessageBody)
    );
  }
}