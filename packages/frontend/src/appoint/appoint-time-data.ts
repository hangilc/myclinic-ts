import type { Appoint, AppointTime } from "myclinic-model";

export class AppointTimeData {
  constructor(
    public appointTime: AppointTime,
    public appoints: Appoint[],
    public followingVacant: AppointTime | undefined
  ) {}

  addAppoint(a: Appoint): void {
    this.appoints.push(a);
  }

  updateAppoint(a: Appoint): void {
    const i = this.appoints.findIndex(x => x.appointId = a.appointId);
    if( i < 0 ){
      console.error("Failed to find appoint.", a);
      return;
    }
    this.appoints.splice(i, 1, a);
  }

  deleteAppoint(a: Appoint): void {
    console.log("before delete", JSON.stringify(this.appoints));
    console.log("deleting appoint", JSON.stringify(a));
    const i = this.appoints.findIndex(e => e.appointId === a.appointId);
    if( i < 0 ){
      console.error("Cannot find appoint to delete.", a);
    } else {
      console.log("i", i);
      this.appoints.splice(i, 1);
      console.log("after delete", JSON.stringify(this.appoints));
    }
  }

  get isRegularVacant(): boolean {
    return (
      this.appointTime.kind === "regular" &&
      this.appoints.length < this.appointTime.capacity
    );
  }

  isConsecutive(follower: AppointTimeData): boolean {
    return this.appointTime.isConsecutive(follower.appointTime);
  }

  get hasVacancy(): boolean {
    return this.appoints.length < this.appointTime.capacity; 
  }
}
