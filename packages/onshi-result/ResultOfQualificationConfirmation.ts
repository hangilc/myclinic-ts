import { castOptStringProp, castStringProp } from "./cast";

interface ResultOfQualificationConfirmationInterface {
  InsuredCardClassification: string;
  Name: string;
  Sex1: string;
  Birthdate: string;
  InsurerName: string;
  InsuredCardSymbol: string | undefined;
}

export class ResultOfQualificationConfirmation implements ResultOfQualificationConfirmationInterface {
  InsuredCardClassification: string;
  Name: string;
  Sex1: string;
  Birthdate: string;
  InsurerName: string;
  InsuredCardSymbol: string | undefined;

  constructor(arg: ResultOfQualificationConfirmationInterface) {
    this.InsuredCardClassification = arg.InsuredCardClassification;
    this.Name = arg.Name;
    this.Sex1 = arg.Sex1;
    this.Birthdate = arg.Birthdate;
    this.InsurerName = arg.InsurerName;
    this.InsuredCardSymbol = arg.InsuredCardSymbol;
  }

  static cast(arg: any): ResultOfQualificationConfirmation {
    return new ResultOfQualificationConfirmation({
      InsuredCardClassification: castStringProp(arg, "InsuredCardClassification"),
      Name: castStringProp(arg, "Name"),
      Sex1: castStringProp(arg, "Sex1"),
      Birthdate: castStringProp(arg, "Birthdate"),
      InsurerName: castStringProp(arg, "InsurerName"),
      InsuredCardSymbol: castOptStringProp(arg, "InsuredCardSymbol"),
    });
  }
}