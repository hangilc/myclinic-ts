import { 診査支払い機関コード } from "codes";
import { ClinicInfo } from "myclinic-model";

interface PatientUnit {
  getRows(): string[];
  hasHoken(): boolean ;
  getKouhiListLength(): number;
  getSouten(): number;
}

export class RezeptFrame {
  rows: string[] = [];
  serial: number = 1;
  rezeptCount: number = 0;
  rezeptSouten: number = 0;

  constructor(seikyuuSaki: "shaho" | "kokuho", year: number, month: number, clinicInfo: ClinicInfo) {
    this.rows.push(create医療機関情報レコード(
      seikyuuSaki === "shaho" ? 診査支払い機関コード.社保基金 : 診査支払い機関コード.国健連合,
      year, month, clinicInfo));
  }

  add(unit: PatientUnit): void {
    this.rows.push(...unit.getRows());
    this.rezeptCount += (unit.hasHoken() ? 1 : 0) + unit.getKouhiListLength();
    this.rezeptSouten += unit.getSouten();
  }

  output(): string {
    return this.rows.join("\r\n") + "\r\n\x1A";
  }
}

function create医療機関情報レコード(arg0: any, year: any, month: any, clinicInfo: any): string {
  throw new Error("Function not implemented.");
}
