import { 診療識別コードCode, 負担区分コードCode } from "codes";

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
  isHonnin: boolean;
  isKoureiJukyuusha?: boolean;
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
}

export interface RezeptShinryou {
  shikibetsuCode: 診療識別コードCode;
  futanKubun: 負担区分コードCode;
  master: RezeptShinryouMaster;
  comments: RezeptComment[];
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
}

export interface RezeptConductDrug {
  master: RezeptIyakuhinMaster;
  amount: number;
}

export interface RezeptConductKizai {
  master: RezeptKizaiMaster;
  amount: number;
  
}

export interface RezeptComment {
  code: number;
  text: string;
  shikibetsucode?: 診療識別コードCode;
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
}