import { DateWrapper } from "myclinic-util";
import type { PrescInfoData } from "./presc-info";

export function issueDateOfPrescInfoAsSqlDate(data: PrescInfoData): string {
  return DateWrapper.fromOnshiDate(data.処方箋交付年月日).asSqlDate();
}
