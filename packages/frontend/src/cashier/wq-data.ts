import { WqueueState, type Patient, type Visit, type Wqueue } from "myclinic-model";

export class WqueueData {
  constructor(
    public wq: Wqueue,
    public visit: Visit,
    public patient: Patient,
  ) {}

  get visitId(): number {
    return this.wq.visitId;
  }

  get isWaitCashier(): boolean {
    return this.wq.waitState === WqueueState.WaitCashier.code;
  }
}
