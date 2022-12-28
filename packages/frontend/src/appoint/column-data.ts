import type { ClinicOperation } from "myclinic-model";
import type { AppointTimeData } from "./appoint-time-data";

export class ColumnData {
  constructor(
    public date: Date,
    public op: ClinicOperation,
    public appointTimes: AppointTimeData[]
  ) {}
}