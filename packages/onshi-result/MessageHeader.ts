import { castOptStringProp, castStringProp } from "./cast";

interface MessageHeaderInterface {
  ProcessExecutionTime: string;
  QualificationConfirmationDate: string;
  MedicalInstitutionCode: string;
  ArbitraryFileIdentifier: string | undefined;
  ReferenceClassification: string;
  SegmentOfResult: string;
  ErrorCode: string | undefined;
  ErrorMessage: string | undefined;
  CharacterCodeIdentifier: string;
}

export class MessageHeader {
  ProcessExecutionTime: string;
  QualificationConfirmationDate: string;
  MedicalInstitutionCode: string;
  ArbitraryFileIdentifier: string | undefined;
  ReferenceClassification: string;
  SegmentOfResult: string;
  ErrorCode: string | undefined;
  ErrorMessage: string | undefined;
  CharacterCodeIdentifier: string;

  constructor(arg: MessageHeaderInterface) {
    this.ProcessExecutionTime = arg.ProcessExecutionTime;
    this.QualificationConfirmationDate = arg.QualificationConfirmationDate;
    this.MedicalInstitutionCode = arg.MedicalInstitutionCode;
    this.ArbitraryFileIdentifier = arg.ArbitraryFileIdentifier;
    this.ReferenceClassification = arg.ReferenceClassification;
    this.SegmentOfResult = arg.SegmentOfResult;
    this.ErrorCode = arg.ErrorCode;
    this.ErrorMessage = arg.ErrorMessage;
    this.CharacterCodeIdentifier = arg.CharacterCodeIdentifier;
  }

  static cast(arg: any): MessageHeader {
    return new MessageHeader({
      ProcessExecutionTime: castStringProp(arg, "ProcessExecutionTime"),
      QualificationConfirmationDate: castStringProp(arg, "QualificationConfirmationDate"),
      MedicalInstitutionCode: castStringProp(arg, "MedicalInstitutionCode"),
      ArbitraryFileIdentifier: castOptStringProp(arg, "ArbitraryFileIdentifier"),
      ReferenceClassification: castStringProp(arg, "ReferenceClassification"),
      SegmentOfResult: castStringProp(arg, "SegmentOfResult"),
      ErrorCode: castOptStringProp(arg, "ErrorCode"),
      ErrorMessage: castOptStringProp(arg, "ErrorMessage"),
      CharacterCodeIdentifier: castStringProp(arg, "CharacterCodeIdentifier"),
    })
  }
}