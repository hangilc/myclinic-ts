export interface RegisterRequest {
  MessageHeader: {
    MedicalInstitutionCode: string;
    ArbitraryFileIdentifier?: string;
  },
  MessageBody: {
    PrescriptionInfo: string;
    IssueType: string; // [OQSCD017]
  }
}

export interface RegisterResult {
  XmlMsg: {
    MessageHeader: {
      ArbitraryFileIdentifier?: string;
      SegmentOfResult: string; // OQSCD003
      ErrorCode?: string;
      ErrorMessage?: string;
      CharacterCodeIdentifier: string; // OQSCD005
    },
    MessageBody?: {
      ProcessingResultStatus: string;
      ProcessingResultCode?: string;
      ProcessingResultMessage?: string;
      PrescriptionId?: string;
      AccessCode?: string;
      XmlCheckResultList?: {
        ResultCode: string;
        ResultMessage: string;
      }[];
      CsvCheckResultList?: {
        ResultCode: string;
        ResultMessage: string;
      }[];
      VerifyResultList?: {
        Status: string;
        Message: string;
        SignId: string;
        FailureReasons?: {
          MessageKey: string;
          MessageCode: string;
          Message: string;
        }[];
      }[];
      GenerateSignResult?: {
        GenerateSignStatus: string;
        GenerateSignMessage: string;
      }
    }
  }
}

export class RegisterResultWrapper {
  result: RegisterResult;

  constructor(result: RegisterResult) {
    this.result = result;
  }

  getPrescriptionId(): string | undefined {
    return this.result.XmlMsg.MessageBody?.PrescriptionId;
  }

  getAccessCode(): string | undefined {
    return this.result.XmlMsg.MessageBody?.AccessCode;
  }
}

export interface SearchResult {
  XmlMsg: {
    MessageHeader: {
      ArbitraryFileIdentifier?: string;
      SegmentOfResult: string; // OQSCD003
      ErrorCode?: string;
      ErrorMessage?: string;
      CharacterCodeIdentifier: string; // OQSCD005
    },
    MessageBody: {
      ProcessingResultStatus: string;
      ProcessingResultCode?: string;
      ProcessingResultMessage?: string;
      PrescriptionIdList?: {
        PrescriptionId: string;
        AccessCode: string;
        CreateDateTime: string;
      }[]
    }
  }
}

