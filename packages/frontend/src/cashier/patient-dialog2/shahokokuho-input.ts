import { intSrc, Invalid, strSrc } from "@/lib/validator";
import { dateSrc } from "@/lib/validators/date-validator";
import { validateShahokokuho } from "@/lib/validators/shahokokuho-validator";
import type { Shahokokuho } from "myclinic-model";

export type ShahokokuhoInput = {
  hokenshaBangou: string;
  kigou: string;
  bangou: string;
  edaban: string;
  honninKazoku: number;
  validFrom: Date | null;
  validUpto: Date | null;
  kourei: number;
};

export function newShahokokuhoInput(): ShahokokuhoInput {
  return {
    hokenshaBangou: "",
    kigou: "",
    bangou: "",
    edaban: "",
    honninKazoku: 0,
    validFrom: null,
    validUpto: null,
    kourei: 0,
  };
}

export function validateShahokokuhoForEnter(
  patientId: number,
  input: ShahokokuhoInput
): Shahokokuho | string[] {
  const validFromErrors: Invalid[] = [];
  const validUptoErrors: Invalid[] = [];
  return validateShahokokuho(0, {
    patientId: intSrc(patientId),
    hokenshaBangou: intSrc(input.hokenshaBangou),
    hihokenshaKigou: strSrc(input.kigou),
    hihokenshaBangou: strSrc(input.bangou),
    honninStore: intSrc(input.honninKazoku),
    validFrom: dateSrc(input.validFrom, validFromErrors),
    validUpto: dateSrc(input.validUpto, validUptoErrors),
    koureiStore: intSrc(input.kourei),
    edaban: strSrc(input.edaban),
  });
}
