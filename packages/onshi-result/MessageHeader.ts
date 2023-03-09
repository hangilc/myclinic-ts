export class MessageHeader {
  
  
  static cast(arg: any): MessageHeader {
    return new MessageHeader(arg.MessageHeader)
  }
}