import type { Appoint, AppointTime } from "myclinic-model";

export class AppointTimeData {
  constructor(
    public appointTime: AppointTime,
    public appoints: Appoint[]
  ) {}
}