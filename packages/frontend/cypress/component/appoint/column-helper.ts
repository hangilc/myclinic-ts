import type { AppointTimeData } from "@/appoint/appoint-time-data";
import { ColumnData } from "@/appoint/column-data";
import { AppointTime, ClinicOperation } from "myclinic-model";
import { ClinicOperationCode } from "myclinic-model/model";

export function mkColumnData(config: {
  date?: string,
  op?: ClinicOperation,
  appointTimes?: AppointTimeData[]
} = {}): ColumnData {
  const date: string = config.date || "2023-02-13";
  const op: ClinicOperation = config.op || new ClinicOperation(ClinicOperationCode.InOperation, "");
  const appointTimes: AppointTimeData[] = config.appointTimes || [];
  return new ColumnData(
    date,
    op,
    appointTimes
  )
}

let nextAppointTimeId: number = 1;

export function mkRegularAppointTime(date: string, from: string, until: string) {
  return new AppointTime(
    nextAppointTimeId++,
    date,
    from,
    until,
    "regular",
    1
  )
}
