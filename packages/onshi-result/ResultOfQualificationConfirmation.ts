import { castStringProp } from "./cast";

interface ResultOfQualificationConfirmationInterface {
  InsuredCardClassification: string;
  Name: string;
  Sex1: string;
  Birthdate: string;
  InsurerName: string;
}

export class ResultOfQualificationConfirmation {
  InsuredCardClassification: string;
  Name: string;
  Sex1: string;
  Birthdate: string;
  InsurerName: string;

  constructor(arg: ResultOfQualificationConfirmationInterface) {
    this.InsuredCardClassification = arg.InsuredCardClassification;
    this.Name = arg.Name;
    this.Sex1 = arg.Sex1;
    this.Birthdate = arg.Birthdate;
    this.InsurerName = arg.InsurerName;
  }

  static cast(arg: any): ResultOfQualificationConfirmation {
    console.log("ResultOfQualificationConfirmation", arg);
    return new ResultOfQualificationConfirmation({
      InsuredCardClassification: castStringProp(arg, "InsuredCardClassification"),
      Name: castStringProp(arg, "Name"),
      Sex1: castStringProp(arg, "Sex1"),
      Birthdate: castStringProp(arg, "Birthdate"),
      InsurerName: castStringProp(arg, "InsurerName"),
    });
  }
}