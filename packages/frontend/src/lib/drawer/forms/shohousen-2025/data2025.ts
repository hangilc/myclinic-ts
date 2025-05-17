export interface ShohousenData2025 {
  clinicAddress?: string;
  clinicName?: string;
  clinicPhone?: string;
  clinicKikancode?: string;
  doctorName?: string;
  clinicTodoufuken?: string;
  hokenshaBangou?: string;
  hihokenshaKigou?: string;
  hihokenshaBangou?: string;
  edaban?: string;
  futansha?: string;
  jukyuusha?: string;
  futansha2?: string;
  jukyuusha2?: string;
  shimei?: string;
  birthdate?: string; // YYYY-MM-DD
  sex?: "M" | "F";
  hokenKubun?: "hihokensha" | "hifuyousha";
  koufuDate?: string; // YYYY-MM-DD
  isDenshi?: boolean;
  accessCode?: string;
}
