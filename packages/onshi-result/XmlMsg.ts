import { MessageBody } from "./MessageBody";
import { MessageHeader } from "./MessageHeader";

export class XmlMsg {
  MessageHeader: MessageHeader;
  MessageBody: MessageBody;

  constructor(MessageHeader: MessageHeader, MessageBody: MessageBody) {
    this.MessageHeader = MessageHeader;
    this.MessageBody = MessageBody;
  }

  get messageHeader(): MessageHeader {
    return this.MessageHeader;
  }

  get messageBody(): MessageBody {
    return this.MessageBody;
  }

  static cast(arg: any): XmlMsg {
    if (typeof arg === "object") {
      return new XmlMsg(
        MessageHeader.cast(arg.MessageHeader),
        MessageBody.cast(arg.MessageBody)
      );
    } else {
      throw new Error("Object expected: " + arg);
    }
  }
}