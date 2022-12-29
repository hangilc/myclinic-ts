import type { Appoint, AppointTime } from "myclinic-model";

export class AppointTimeData {
  constructor(
    public appointTime: AppointTime,
    public appoints: Appoint[]
  ) {}

  addAppoint(a: Appoint): void {
    this.appoints.push(a);
  }
}