import { Payer } from "futan/calc";
import type { 症状詳記区分コードCode, 診療識別コードCode, 負担区分コードCode } from "./codes";

export interface ClinicInfo {    
  name: string,
  address: string,
  tel: string,
  kikancode: string,
}

export interface Cover {
  kakari: number;
  remaining: number;
}

export interface Hokensha {
  futanWari: number;
  hokenshaBangou: number;
  hihokenshaKigou?: string;
  hihokenshaBangou: string;
  isHonnin?: boolean;
  isKoureiJukyuusha?: boolean;
  edaban?: string;
  payer: Payer;
}

export interface KouhiProcessorArg {
  kakari: number;
  totalTen: number;
  hokenFutanWari: number | undefined;
  prevPatientCharge: number;
  gendogakuApplied: number | undefined;
  debug?: boolean;
}

export type KouhiProcessor = (arg: KouhiProcessorArg) => Cover;

export interface KouhiData {
  processor: KouhiProcessor;
  houbetsu: number;
  futanshaBangou?: number;
}

export interface RezeptVisit {
  visitedAt: string; // 0000-00-00
  shinryouList: RezeptShinryou[];
  conducts: RezeptConduct[];
  shoujouShoukiList: RezeptShoujouShouki[];
  comments: RezeptComment[];
}

export interface RezeptShinryou {
  shikibetsuCode: 診療識別コードCode;
  futanKubun: 負担区分コードCode;
  master: RezeptShinryouMaster;
  comments: RezeptComment[];
  amount?: number;
}

export interface RezeptDrug {
  shikibetsuCode: 診療識別コードCode;
  futanKubun: 負担区分コードCode;
  master: RezeptIyakuhinMaster;
  comments: RezeptComment[];
}

export interface RezeptConduct { // 処置
  futanKubun: 負担区分コードCode;
  shikibetsuCode: 診療識別コードCode;
  shinryouList: RezeptConductShinryou[];
  drugList: RezeptConductDrug[];
  kizaiList: RezeptConductKizai[];
}

export interface RezeptConductShinryou {
  master: RezeptShinryouMaster;
  comments: RezeptComment[];
  amount?: number;
}

export interface RezeptConductDrug {
  master: RezeptIyakuhinMaster;
  amount: number;
  comments: RezeptComment[];
}

export interface RezeptConductKizai {
  master: RezeptKizaiMaster;
  amount: number;
  comments: RezeptComment[];
}

export interface RezeptComment {
  code: number;
  text: string;
  shikibetsuCode?: 診療識別コードCode;
  futanKubun?: 負担区分コードCode;
}

export interface RezeptShinryouMaster {
  shinryoucode: number;
  tensuu: number;
  name: string;
  houkatsukensa: string;
}

export interface RezeptIyakuhinMaster {
  iyakuhincode: number;
  yakka: number;
  name: string;
  unit: string;
}

export interface RezeptKizaiMaster {
  kizaicode: number;
  kingaku: number;
  name: string;
  unit: string;
}

export interface RezeptPatient {
  name: string;
  sex: "M" | "F";
  birthday: string; // 0000-00-00
  patientId?: string;
}

export interface RezeptKouhi {
  futansha: number;
  jukyuusha: number;
  jikofutan?: number;
  payer: Payer;
}

export type HokenSelector = "H" | "1" | "2" | "3" | "4";

export interface RezeptDisease {
  shoubyoumeicode: number;
  adjcodes: number[];
  startDate: string; // 0000-00-00
  endReason: 
    "N" // 継続
    | "C" // 治癒
    | "S" // 中止
    | "D" // 死亡
    ;
}

export interface RezeptShoujouShouki {
  kubun: 症状詳記区分コードCode;
  text: string;
}