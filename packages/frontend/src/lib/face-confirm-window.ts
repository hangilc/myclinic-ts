import type { Kouhi, Koukikourei, Patient, Shahokokuho } from "myclinic-model";
import type { OnshiResult } from "onshi-result";
import type { ResultOfQualificationConfirmation } from "onshi-result/ResultOfQualificationConfirmation";

export class AllResolved {
  constructor(
    public patient: Patient,
    public hoken: Shahokokuho | Koukikourei,
    public kouhiList: Kouhi[],
    public onshiResult: OnshiResult,
    public at: string, // date time
  ) { }
}

export class MultiplePatients {
  constructor(
    public patients: Patient[],
    public result: ResultOfQualificationConfirmation,
  ) {}
}

export class InconsistentHoken {
  constructor(
    public patient: Patient,
    public shahokokuhoOpt: Shahokokuho | undefined,
    public koukikoureiOpt: Koukikourei | undefined,
    public result: ResultOfQualificationConfirmation,
  ) {}
}