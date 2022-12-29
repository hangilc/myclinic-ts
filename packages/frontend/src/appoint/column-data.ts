import type { ClinicOperation } from "myclinic-model";
import type { AppointTimeData } from "./appoint-time-data";

export class ColumnData {
  constructor(
    public date: string,
    public op: ClinicOperation,
    public appointTimes: AppointTimeData[]
  ) {}

  addAppointTimeData(data: AppointTimeData): void {
    this.appointTimes.push(data);
    this.appointTimes.sort((a, b) =>
      a.appointTime.fromTime.localeCompare(b.appointTime.fromTime)
    );
  }

  findAppointTimeData(appointTimeId: number): AppointTimeData | undefined {
    for(let d of this.appointTimes){
      if( d.appointTime.appointTimeId === appointTimeId ){
        return d;
      }
    }
    return undefined;
  }
}
