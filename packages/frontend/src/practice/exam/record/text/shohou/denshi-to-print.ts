import type { PrescInfoData } from "@/lib/denshi-shohou/presc-info";
import type { Shohousen2024Data } from "@/lib/drawer/forms/shohousen-2024/shohousenData2024";

export function denshiToPrint(src: PrescInfoData): Shohousen2024Data {
  const data: Shohousen2024Data = {
    clinicAddress: src.医療機関所在地,
    // clinicName?: string,
    // clinicPhone?: string,
    // clinicKikancode?: string,
    // doctorName?: string,
    // clinicTodoufuken?: string,
    // hokenshaBangou?: string,
    // hihokenshaKigou?: string,
    // hihokenshaBangou?: string,
    // edaban?: string,
    // futansha?: string,
    // jukyuusha?: string,
    // futansha2?: string,
    // jukyuusha2?: string,
    // shimei?: string,
    // birthdate?: string, // YYYY-MM-DD
    // sex?: "M" | "F",
    // hokenKubun?: "hihokensha" | "hifuyousha",
    // koufuDate?: string, // YYYY-MM-DD
    // drugs?: Shohou,
    // isDenshi?: boolean,
    // accessCode?: string,
  };
  return data;
}