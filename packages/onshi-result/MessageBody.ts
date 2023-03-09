import { castStringProp } from "./cast";
import { ResultOfQualificationConfirmation } from "./ResultOfQualificationConfirmation";

interface MessageBodyInterface {
  ProcessingResultStatus: string;
  ResultList: ResultOfQualificationConfirmation[];
}

export class MessageBody {
  ProcessingResultStatus: string;
  ResultList: ResultOfQualificationConfirmation[];

  constructor(arg: MessageBodyInterface) {
    this.ProcessingResultStatus = arg.ProcessingResultStatus;
    this.ResultList = arg.ResultList;
  }

  static cast(arg: any): MessageBody {
    if (typeof arg === "object") {
      return new MessageBody({
        ProcessingResultStatus: castStringProp(arg, "ProcessingResultStatus"),
        ResultList: castResultList(arg.ResultList),
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