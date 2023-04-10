import { ResultOfQualificationConfirmation, ResultOfQualificationConfirmationInterface } from "ResultOfQualificationConfirmation";

export interface ResultItemInterface {
  ResultOfQualificationConfirmation: ResultOfQualificationConfirmationInterface;
}

export class ResultItem {
  orig: ResultItemInterface;
  resultOfQualificationConfirmation: ResultOfQualificationConfirmation

  constructor(orig: ResultItemInterface) {
    this.orig = orig;
    this.resultOfQualificationConfirmation =
      ResultOfQualificationConfirmation.cast(orig.ResultOfQualificationConfirmation);
  }

  get name(): string {
    return this.resultOfQualificationConfirmation.name;
  }

  get nameKana(): string | undefined {
    return this.resultOfQualificationConfirmation.nameKana;
  }

  toJSON(): object {
    return this.orig;
  }

  static isResultItemInterface(arg: any): arg is ResultItemInterface {
    if( typeof arg === "object" ){
      return ResultOfQualificationConfirmation.isResultOfQualificationConfirmationInterface(
        arg.ResultOfQualificationConfirmation
      )
    } else {
      return false;
    }
  }

  static cast(arg: any): ResultItem {
    if( this.isResultItemInterface(arg) ){
      return new ResultItem(arg);
    } else {
      throw new Error("Cannot create ResultItem");
    }
  }
}