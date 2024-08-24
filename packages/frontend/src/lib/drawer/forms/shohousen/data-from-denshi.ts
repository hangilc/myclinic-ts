import type { PrescInfoData } from "@/lib/denshi-shohou/presc-info";
import type { ShohousenData } from "./data";
import { 点数表_to_code } from "@/lib/denshi-shohou/denshi-shohou";

export function create_data_from_denshi(denshi: PrescInfoData): ShohousenData {
  console.log(JSON.stringify(denshi, undefined, 2));
  let hihokensha = denshi.被保険者証番号;
  {
    const kigou = denshi.被保険者証記号;
    if (kigou) {
      hihokensha = `${kigou}・${hihokensha}`;
    }
  }
  let futansha: string | undefined = undefined;
  let jukyuusha: string | undefined = undefined;
  if (denshi.第一公費レコード) {
    const kouhi = denshi.第一公費レコード;
    futansha = kouhi.公費負担者番号;
    jukyuusha = kouhi.公費受給者番号;
  }
  let futansha2: string | undefined = undefined;
  let jukyuusha2: string | undefined = undefined;
  if (denshi.第二公費レコード) {
    const kouhi = denshi.第二公費レコード;
    futansha2 = kouhi.公費負担者番号;
    jukyuusha2 = kouhi.公費受給者番号;
  }
  let birthdate = `${denshi.患者生年月日.substring(0, 4)}-${denshi.患者生年月日.substring(4, 6)}-${denshi.患者生年月日.substring(6, 8)}`;
  let sex: "M" | "F";
  if (denshi.患者性別 === "男") {
    sex = "M";
  } else {
    sex = "F";
  }

  return {
    clinicAddress: `〒{${denshi.医療機関郵便番号}} {${denshi.医療機関所在地}}`,
    clinicName: `${denshi.医療機関名称}`,
    clinicPhone: `${denshi.医療機関電話番号}`,
    clinicKikancode: `${denshi.医療機関都道府県コード}${点数表_to_code(denshi.医療機関コード種別)}${denshi.医療機関コード}`,
    doctorName: `${denshi.医師漢字氏名}`,
    hokenshaBangou: `${denshi.保険者番号}`,
    hihokensha,
    futansha,
    jukyuusha,
    futansha2,
    jukyuusha2,
    shimei: `${denshi.患者漢字氏名}`,
    birthdate,
    sex,
    hokenKubun: resolveHokenKubun(denshi.レセプト種別コード),
  };
}

function resolveHokenKubun(shubetsu: string | undefined): "hihokensha" | "hifuyousha" | undefined {
  switch (shubetsu) {
    case "1112":
    case "1118":
    case "1110":
    case "1122":
    case "1128":
    case "1120":
    case "1132":
    case "1138":
    case "1130":
    case "1318":
    case "1310":
    case "1328":
    case "1320":
    case "1338":
    case "1330":

      {
        return "hihokensha";
      }
    case "1116":
    case "1126":
    case "1136":
      {
        return "hifuyousha";
      }
    default: return undefined;
  }
}