export class XmlMsg {
  MessageHeader: MessageHeader;
  MessageBody: MessageBoxy;

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