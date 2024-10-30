// OQSCD003

export type SegmentOfResultType = "正常終了" | "処理中" | "異常終了";

export function getSegmentOfResultType(code: string): SegmentOfResultType {
  switch (code) {
    case "1": return "正常終了";
    case "2": return "処理中";
    case "9": return "異常終了";
    default: throw new Error(`unknown SegmentOfResult: ${code}`)
  }
}

// OQSCD004

export type ProcessingResultStatusType = "正常終了" | "エラー";

export function getProcessingResultStatusType(code: string): ProcessingResultStatusType {
  switch (code) {
    case "1": return "正常終了";
    case "2": return "エラー";
    default: throw new Error(`unknown ProcessingResultStatus: ${code}`)
  }
}

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
      ProcessingResultStatus: string; // OQSCD004
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

export interface UnregisterResult {
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
    }
  }
}


export interface StatusResult {
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
      PrescriptionStatus: string;
      // "当該処方箋は処方箋取消されています。"
      // "薬局にて受付されていません。"
      // "薬局にて調剤中です。"
      // "薬局にて調剤済です。"
      // "薬局にて回収済です。"
      ReceptionPharmacyCode?: string;
      ReceptionPharmacyName?: string;
      MessageFlg?: string; // 1: 伝達事項なし, 2: 伝達事項あり
      DispensingResult?: string;
    }
  }
}

export interface HikaeResult {
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
      PrescriptionReferenceInformationFile: string;
    }
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

export interface ResultHeader {
  XmlMsg: {
    MessageHeader: {
      ArbitraryFileIdentifier?: string;
      SegmentOfResult: string; // OQSCD003
      ErrorCode?: string;
      ErrorMessage?: string;
      CharacterCodeIdentifier: string; // OQSCD005
    },
  }

}

export function checkShohouResult(r: ResultHeader): string | undefined {
  let h = r.XmlMsg.MessageHeader;
  if( h.SegmentOfResult !== "1" ){
    return h.ErrorMessage;
  } else {
    return undefined;
  }
}

