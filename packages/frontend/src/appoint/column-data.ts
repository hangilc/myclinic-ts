import type { Appoint, AppointTime, ClinicOperation } from "myclinic-model";
import { AppointKind, resolveAppointKind } from "./appoint-kind";
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
    this.fixFollowingVacant(i - 1);
    this.fixFollowingVacant(i);
  }

  updateAppointTime(a: AppointTime): boolean {
    const i = this.appointTimes.findIndex(d => d.appointTime.appointTimeId === a.appointTimeId);
    if( i >= 0 ){
      const d = this.appointTimes[i];
      d.appointTime = a;
      console.log("updated", d);
      return true;
    }
    return false;
  }

  deleteAppointTime(a: AppointTime): boolean {
    const i = this.appointTimes.findIndex(d => d.appointTime.appointTimeId === a.appointTimeId);
    if( i >= 0 ){
      this.appointTimes.splice(i, 1);
      return true;
    }
    return false;
  }

  fixFollowingVacant(i: number): void {
    if (i >= 0 && i < this.appointTimes.length) {
      const target = this.appointTimes[i];
      const j = i + 1;
      if (j < this.appointTimes.length) {
        const next = this.appointTimes[j];
        target.followingVacant = next.isRegularVacant
          ? next.appointTime
          : undefined;
      } else {
        target.followingVacant = undefined;
      }
    }
  }

  findAppointTimeDataIndex(appointTimeId: number): number {
    for (let i = 0; i < this.appointTimes.length; i++) {
      const d = this.appointTimes[i];
      if (d.appointTime.appointTimeId === appointTimeId) {
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
    this.fixFollowingVacant(i - 1);
  }

  updateAppoint(i: number, a: Appoint): void {
    const atd = this.appointTimes[i];
    atd.updateAppoint(a);
  }

  deleteAppoint(i: number, a: Appoint): void {
    const atd = this.appointTimes[i];
    atd.deleteAppoint(a);
    this.fixFollowingVacant(i - 1);
  }

  collectAvail(): AppointKind[] {
    const acc = new AvailCounter();
    this.appointTimes.forEach((d) => {
      const at = d.appointTime;
      if (at.capacity > d.appoints.length) {
        acc.addCode(at.kind);
      }
    });
    return acc.result;
  }

  countKenshin(): number {
    let count = 0;
    this.appointTimes.forEach((at) => {
      at.appoints.forEach((a) => {
        if (a.tags.includes("健診")) {
          count += 1;
        }
      });
    });
    return count;
  }

  planBind(at: AppointTime): AppointTime | undefined {
    const i = this.appointTimes.findIndex(
      (a) => a.appointTime.appointTimeId === at.appointTimeId
    );
    if (i >= 0) {
      const j = i + 1;
      if (j <= this.appointTimes.length) {
        const n = this.appointTimes[j];
        if (n.appoints.length === 0) {
          return n.appointTime;
        }
      }
    }
    return undefined;
  }
}

class AvailCounter {
  map: Record<string, boolean> = {};

  addCode(code: string): void {
    this.map[code] = true;
  }

  get result(): AppointKind[] {
    const list: AppointKind[] = Object.keys(this.map)
      .map((c) => resolveAppointKind(c))
      .filter((k): k is AppointKind => k instanceof AppointKind);
    list.sort((a, b) => a.ord - b.ord);
    return list;
  }
}
