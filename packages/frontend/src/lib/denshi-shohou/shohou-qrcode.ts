import type { PrescInfoData } from "./presc-info";

export function createQrCodeContent(data: PrescInfoData): string {
  return [
    data.保険者番号, data.被保険者証記号 ?? "", data.被保険者証番号,
    data.被保険者証枝番 ?? "", data.患者生年月日, data.引換番号 ?? ""
  ].join(",");
}

// export function createQrCodeContent(data: PrescInfoData): string {
//   const comp = new ContentComposer();
//   comp.addVersion();
//   comp.医療機関レコード(data.医療機関コード, data.医療機関都道府県コード, data.医療機関名称);
//   comp.医療機関電話レコード(data.医療機関電話番号);
//   comp.医師レコード(data.医師漢字氏名);
//   comp.患者氏名レコード(data.患者漢字氏名);
//   comp.患者性別レコード(data.患者性別);
//   comp.患者生年月日レコード(data.患者生年月日);
//   comp.患者一部負担区分レコード(患者一部負担区分_from_レセプト種別コード(data.レセプト種別コード));
//   comp.保険者番号レコード(data.保険者番号);
//   comp.記号番号レコード(data.被保険者証記号, data.被保険者証番号, data.被保険者被扶養者, data.被保険者証枝番);

//   return comp.getString();
// }

// class ContentComposer {
//   lines: string[] = [];

//   addRecord(recNum: number, ...items: string[]) {
//     const line = [recNum.toString(), ...items].join(",") + "\r\n";
//     this.lines.push(line);
//   }

//   addVersion() {
//     this.lines.push("JAHIS9\r\n");
//   }

//   医療機関レコード(kikancode: string, todoufuken: string, clinicName: string) {
//     this.addRecord(1, "1", kikancode, todoufuken, clinicName);
//   }

//   医療機関電話レコード(phone: string) {
//     this.addRecord(3, phone, "", "");
//   }

//   医師レコード(doctorName: string) {
//     this.addRecord(5, "", "", doctorName);
//   }

//   患者氏名レコード(name: string) {
//     this.addRecord(11, "", name, "");
//   }

//   患者性別レコード(sex: "男" | "女") {
//     let code: string;
//     if( sex === "男" ){
//       code = "1";
//     } else {
//       code = "2";
//     }
//     this.addRecord(12, code);
//   }

//   患者生年月日レコード(birthdate: string) {
//     this.addRecord(13, birthdate);
//   }

//   患者一部負担区分レコード(code: number | undefined) {
//     if( code !== undefined ){
//       this.addRecord(14, code.toString());
//     }
//   }

//   保険者番号レコード(bangou: string) {
//     this.addRecord(22, bangou);
//   }

//   記号番号レコード(kigou: string | undefined, bangou: string, honnin: "被保険者" | "被扶養者", edaban: string | undefined) {
//     this.addRecord(23, kigou ?? "", bangou, honnin === "被保険者" ? "1" : "2", edaban ?? "");
//   }

//   getString(): string {
//     return this.lines.join("");
//   }
// }

// // 患者一部負担区分
// // 1: 高齢者一般, 2: 高齢者７割, 3: ６歳未満, 4: 高齢者一般（９割）, 5: 高齢者８割（後期高齢）
// function 患者一部負担区分_from_レセプト種別コード(shubetsu: string | undefined): number | undefined{
//   if( shubetsu === undefined ){
//     return undefined;
//   }
//   switch(shubetsu){
//     case "1114": 
//     case "1124": 
//     case "1134": 
//     case "1144": 
//     {
//       return 3;
//     }
//     case "1118": 
//     case "1128": 
//     case "1138": 
//     case "1148": 
//     case "1318":
//     case "1328":
//     case "1338":
//     case "1348":
//     {
//       return 4;
//     }
//     case "1110": 
//     case "1120": 
//     case "1130": 
//     case "1140": 
//     case "1310":
//     case "1320":
//     case "1330":
//     case "1340":
//     {
//       return 2;
//     }
//     default: {
//       return undefined;
//     }
//   }
// }