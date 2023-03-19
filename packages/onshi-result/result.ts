import { MessageHeader } from "./MessageHeader";
import { MessageBody } from "./MessageBody";
import { XmlMsg } from "./XmlMsg";
import { ResultOfQualificationConfirmation } from "./ResultOfQualificationConfirmation";

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

  static cast(arg: any): OnshiResult {
    return new OnshiResult(
      XmlMsg.cast(arg.XmlMsg)
    )
  }
}