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

  get isRegularVacant(): boolean {
    return (
      this.appointTime.kind === "regular" &&
      this.appoints.length < this.appointTime.capacity
    );
  }

  isConsecutive(follower: AppointTimeData): boolean {
    return this.appointTime.isConsecutive(follower.appointTime);
  }
}
