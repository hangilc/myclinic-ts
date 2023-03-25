import { MessageBody } from "./MessageBody";
import { MessageHeader } from "./MessageHeader";

export class XmlMsg {
  messageHeader: MessageHeader;
  messageBody: MessageBody;

  constructor(messageHeader: MessageHeader, messageBody: MessageBody) {
    this.messageHeader = messageHeader;
    this.messageBody = messageBody;
  }

  toJsonObject(): object {
    return {
      MessageHeader: this.messageHeader.toJsonObject(),
      MessageBody: this.messageBody.toJsonObject(),
    }
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