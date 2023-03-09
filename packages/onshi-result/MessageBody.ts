import { castStringProp } from "./cast";
import { ResultOfQualificationConfirmation } from "./ResultOfQualificationConfirmation";
import { QualificationConfirmSearchInfo } from "./QualificationConfirmSearchInfo";

interface MessageBodyInterface {
  ProcessingResultStatus: string;
  ResultList: ResultOfQualificationConfirmation[];
  QualificationConfirmSearchInfo: QualificationConfirmSearchInfo | undefined;
}

export class MessageBody implements MessageBodyInterface {
  ProcessingResultStatus: string;
  ResultList: ResultOfQualificationConfirmation[];
  QualificationConfirmSearchInfo: QualificationConfirmSearchInfo | undefined;

  constructor(arg: MessageBodyInterface) {
    this.ProcessingResultStatus = arg.ProcessingResultStatus;
    this.ResultList = arg.ResultList;
    this.QualificationConfirmSearchInfo = arg.QualificationConfirmSearchInfo;
  }

  static cast(arg: any): MessageBody {
    if (typeof arg === "object") {
      return new MessageBody({
        ProcessingResultStatus: castStringProp(arg, "ProcessingResultStatus"),
        ResultList: castResultList(arg.ResultList),
        QualificationConfirmSearchInfo: 
          castQualificationConfirmSearchInfo(arg.QualificationConfirmSearchInfo)
      });
    } else {
      throw new Error("Object expected: " + arg);
    }
  }
}

function castResultList(arg: any): ResultOfQualificationConfirmation[] {
  if (arg == undefined) {
    return [];
  } else if (Array.isArray(arg)) {
    return arg.map(e => ResultOfQualificationConfirmation.cast(e.ResultOfQualificationConfirmation));
  } else {
    throw new Error("Array or undefined expected: " + arg);
  }
}

function castQualificationConfirmSearchInfo(arg: any): QualificationConfirmSearchInfo | undefined {
  if( arg == undefined ){
    return undefined;
  } else {
    return QualificationConfirmSearchInfo.cast(arg);
  }
}