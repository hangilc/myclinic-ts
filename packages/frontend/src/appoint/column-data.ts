import type { Appoint, ClinicOperation } from "myclinic-model";
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
    const i = this.findAppointTimeDataIndex(data.appointTime.appointTimeId);
    this.fixFollowingVacant(i-1);
    this.fixFollowingVacant(i);
  }

  fixFollowingVacant(i: number): void {
    if( i >= 0 && i < this.appointTimes.length ){
      const target = this.appointTimes[i];
      const j = i + 1;
      if( j < this.appointTimes.length ){
        const next = this.appointTimes[j];
        target.followingVacant = next.isRegularVacant ? next.appointTime : undefined;
      } else {
        target.followingVacant = undefined;
      }
    }
  }

  // fixFollowingVacantOrig(i: number): void {
  //   const data = this.appointTimes[i];
  //   if( i > 0 ){
  //     const prev = this.appointTimes[i-1];
  //     if( prev.isConsecutive(data) ){
  //       prev.followingVacant = data.isRegularVacant ? data.appointTime : undefined;
  //     }
  //   } else {
  //     if( i+1 < this.appointTimes.length ){
  //       const next = this.appointTimes[i+1];
  //       data.followingVacant = next.isRegularVacant ? next.appointTime : undefined;
  //     } else {
  //       data.followingVacant = undefined;
  //     }
  //   }
  // }

  findAppointTimeDataIndex(appointTimeId: number): number {
    for(let i=0;i<this.appointTimes.length;i++){
      const d = this.appointTimes[i];
      if( d.appointTime.appointTimeId === appointTimeId ){
        return i;
      }
    }
    return -1;
  }

  findAppointTimeData(appointTimeId: number): AppointTimeData | undefined {
    const i = this.findAppointTimeDataIndex(appointTimeId);
    return i >= 0 ? this.appointTimes[i] : undefined;
  }

  addAppoint(i: number, a: Appoint): void {
    const atd = this.appointTimes[i];
    atd.addAppoint(a);
    this.fixFollowingVacant(i-1);
  }

  updateAppoint(i: number, a: Appoint): void {
    const atd = this.appointTimes[i];
    atd.updateAppoint(a);
  }

  deleteAppoint(i: number, a: Appoint): void {
    const atd = this.appointTimes[i];
    atd.deleteAppoint(a);
    this.fixFollowingVacant(i-1);
  }
}
