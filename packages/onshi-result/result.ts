import { XmlMsg } from "./XmlMsg";

export class OnshiResult {
  XmlMsg: XmlMsg 

  constructor(XmlMsg: XmlMsg) {
    this.XmlMsg = XmlMsg;
  }

  static cast(arg: any): OnshiResult {
    return new OnshiResult(
      XmlMsg.cast(arg.XmlMsg)
    )
  }
}