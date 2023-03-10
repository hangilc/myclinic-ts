import { MessageHeader } from "./MessageHeader";
import { MessageBody } from "./MessageBody";
import { XmlMsg } from "./XmlMsg";

export class OnshiResult {
  XmlMsg: XmlMsg 

  constructor(XmlMsg: XmlMsg) {
    this.XmlMsg = XmlMsg;
  }

  get xmlMsg(): XmlMsg {
    return this.XmlMsg;
  }

  get messageHeader(): MessageHeader {
    return this.xmlMsg.messageHeader;
  }

  get messageBody(): MessageBody {
    return this.xmlMsg.messageBody;
  }

  static cast(arg: any): OnshiResult {
    return new OnshiResult(
      XmlMsg.cast(arg.XmlMsg)
    )
  }
}