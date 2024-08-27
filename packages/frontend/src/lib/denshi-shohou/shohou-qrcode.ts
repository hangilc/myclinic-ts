import type { PrescInfoData } from "./presc-info";

export function createQrCodeContent(data: PrescInfoData): string {
  const comp = new ContentComposer();
  comp.addVersion();
  comp.医療機関レコード(data.医療機関コード, data.医療機関都道府県コード, data.医療機関名称);
  comp.医療機関電話レコード(data.医療機関電話番号);
  comp.医師レコード(data.医師漢字氏名);
  comp.患者氏名レコード(data.患者漢字氏名);
  comp.患者性別レコード(data.患者性別);
  comp.患者生年月日レコード(data.患者生年月日);

  return comp.getString();
}

class ContentComposer {
  lines: string[] = [];

  addRecord(recNum: number, ...items: string[]) {
    const line = [recNum.toString(), ...items].join(",") + "\r\n";
    this.lines.push(line);
  }

  addVersion() {
    this.lines.push("JAHIS9\r\n");
  }

  医療機関レコード(kikancode: string, todoufuken: string, clinicName: string) {
    this.addRecord(1, "1", kikancode, todoufuken, clinicName);
  }

  医療機関電話レコード(phone: string) {
    this.addRecord(3, phone, "", "");
  }

  医師レコード(doctorName: string) {
    this.addRecord(5, "", "", doctorName);
  }

  患者氏名レコード(name: string) {
    this.addRecord(11, "", name, "");
  }

  患者性別レコード(sex: "男" | "女") {
    let code: string;
    if( sex === "男" ){
      code = "1";
    } else {
      code = "2";
    }
    this.addRecord(12, code);
  }

  患者生年月日レコード(birthdate: string) {
    this.addRecord(13, birthdate);
  }

  getString(): string {
    return this.lines.join("");
  }
}