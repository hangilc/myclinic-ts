import { 診療識別コードCode, 負担区分コードCode } from "codes";

export interface ClinicInfo {    
  name: string,
  address: string,
  tel: string,
  kikancode: string,
  // postalCode: string,
  // fax: string,
  // todoufukencode: string,
  // tensuuhyoucode: string,
  // homepage: string,
  // doctorName: string,
}

export interface Cover {
  kakari: number;
  remaining: number;
}

export interface Hokensha {

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
  
}

export interface RezeptConductKizai {
  
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

