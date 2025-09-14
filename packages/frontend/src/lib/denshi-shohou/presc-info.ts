import {
  DenshiShohou, type 点数表, type 診療科コード, type 診療科コード種別,
  type 性別コード, type 保険一部負担金区分コード, type 保険種別コード, type 被保険者等種別,
  type 職務上の事由コード, type 残薬確認対応フラグ, type 備考種別, type 剤形区分, type 用法補足区分,
  type 情報区分, type 薬品コード種別, type 力価フラグ, type 薬品補足区分, tryCastTo薬品補足区分, type 都道府県コード
} from "./denshi-shohou";

export interface PrescInfoData {
  医療機関コード種別: 点数表;
  医療機関コード: string;
  医療機関都道府県コード: 都道府県コード;
  医療機関名称: string;
  医療機関郵便番号?: string;
  医療機関所在地: string;
  医療機関電話番号: string;
  ＦＡＸ番号?: string;
  その他連絡先?: string;
  診療科レコード?: {
    診療科コード種別: 診療科コード種別;
    診療科コード: 診療科コード;
  },
  医師コード?: string;
  医師カナ氏名?: string;
  医師漢字氏名: string; // 姓と名は全角スペースで区切る。
  患者コード?: string;
  患者漢字氏名: string; // 性と名は全角スペースで区切る。
  患者カナ氏名: string; // 半角カナで記録する。姓と名は半角スペースで区切る。
  患者性別: 性別コード;
  患者生年月日: string;
  保険一部負担金区分?: 保険一部負担金区分コード;
  保険種別?: 保険種別コード;
  保険者番号: string;
  被保険者証記号?: string;
  被保険者証番号: string;
  被保険者被扶養者: 被保険者等種別;
  被保険者証枝番?: string;
  負担割合?: number; // 患者負担割合
  職務上の事由?: 職務上の事由コード;
  第一公費レコード?: 公費レコード;
  第二公費レコード?: 公費レコード;
  第三公費レコード?: 公費レコード;
  特殊公費レコード?: 公費レコード;
  レセプト種別コード?: string;
  処方箋交付年月日: string;
  使用期限年月日?: string;
  麻薬施用レコード?: 麻薬施用レコード;
  残薬確認対応フラグ?: 残薬確認対応フラグ;
  備考レコード?: 備考レコード[];
  引換番号?: string;
  RP剤情報グループ: RP剤情報[];
  提供情報レコード?: 提供情報レコード;
}

export interface 公費レコード {
  公費負担者番号: string;
  公費受給者番号?: string;
}

export function eq公費レコード(a: 公費レコード, b: 公費レコード): boolean {
  return a.公費負担者番号 === b.公費負担者番号 && a.公費受給者番号 === b.公費受給者番号;
}

export interface 麻薬施用レコード {
  麻薬施用者免許番号: string;
  麻薬施用患者住所: string;
  麻薬施用患者電話番号: string;
}

export interface 備考レコード {
  備考: string;
}

export interface RP剤情報 {
  剤形レコード: 剤形レコード;
  用法レコード: 用法レコード;
  用法補足レコード?: 用法補足レコード[];
  薬品情報グループ: 薬品情報[];
}

export interface 剤形レコード {
  剤形区分: 剤形区分;
  剤形名称?: string;
  調剤数量: number;
}

export interface 用法レコード {
  用法コード: string;
  用法名称: string;
  用法１日回数?: number;
}

export const 用法レコードObject = {
  isEqual(a: 用法レコード, b: 用法レコード): boolean {
    return a.用法コード == b.用法コード &&
      a.用法名称 === b.用法コード &&
      a.用法１日回数 == b.用法１日回数;
  }
}

export interface 用法補足レコード {
  用法補足区分?: 用法補足区分;
  用法補足情報: string;
}

export const 用法補足レコードObject = {
  isEqual(a: 用法補足レコード, b: 用法補足レコード): boolean {
    return a.用法補足区分 == b.用法補足区分 && a.用法補足情報 === b.用法補足情報;
  },

  isEqualArray(as: 用法補足レコード[], bs: 用法補足レコード[]): boolean {
    if (as.length !== bs.length) {
      return false;
    }
    for (let i = 0; i < as.length; i++) {
      if (!用法補足レコードObject.isEqual(as[i], bs[i])) {
        return false;
      }
    }
    return true;
  }
}

export interface 薬品情報 {
  薬品レコード: 薬品レコード;
  単位変換レコード?: string;
  不均等レコード?: 不均等レコード;
  負担区分レコード?: 負担区分レコード;
  薬品１回服用量レコード?: 薬品１回服用量レコード;
  薬品補足レコード?: 薬品補足レコード[];
}

export interface 薬品レコード {
  情報区分: 情報区分;
  薬品コード種別: 薬品コード種別;
  薬品コード: string;
  薬品名称: string;
  分量: string;
  力価フラグ: 力価フラグ;
  単位名: string;
}

export interface 不均等レコード {
  不均等１回目服用量: string; 不均等２回目服用量: string;
  不均等３回目服用量?: string; 不均等４回目服用量?: string;
  不均等５回目服用量?: string;
}

export interface 負担区分レコード {
  第一公費負担区分?: boolean; 第二公費負担区分?: boolean;
  第三公費負担区分?: boolean; 特殊公費負担区分?: boolean;
}

export interface 薬品１回服用量レコード {
  薬剤１回服用量: string;
  薬剤１日服用回数?: number;
}

export interface 薬品補足レコード {
  薬品補足情報: string;
}

export interface 提供情報レコード {
  提供診療情報レコード?: 提供診療情報レコード[];
  検査値データ等レコード?: 検査値データ等レコード[];
}

export interface 提供診療情報レコード {
  薬品名称?: string;
  コメント: string;
}

export interface 検査値データ等レコード {
  検査値データ等: string;
}

export function createPrescInfo(data: PrescInfoData): string {
  const shohou = new DenshiShohou();
  shohou.医療機関レコード(data.医療機関コード種別, data.医療機関コード, data.医療機関都道府県コード, data.医療機関名称);
  shohou.医療機関所在地レコード(data.医療機関郵便番号, data.医療機関所在地);
  shohou.医療機関電話レコード(data.医療機関電話番号, data.ＦＡＸ番号, data.その他連絡先);
  if (data.診療科レコード) {
    let 診療科コード = data.診療科レコード.診療科コード;
    let 診療科名 = 診療科コード;
    shohou.医療機関診療科レコード(data.診療科レコード.診療科コード種別, 診療科コード, 診療科名);
  }
  shohou.医師レコード(data.医師コード, data.医師カナ氏名, data.医師漢字氏名);
  shohou.患者氏名レコード(data.患者コード, data.患者漢字氏名, data.患者カナ氏名);
  shohou.患者性別レコード(data.患者性別);
  shohou.患者生年月日レコード(data.患者生年月日);
  if (data.保険一部負担金区分) {
    shohou.患者一部負担区分レコード(data.保険一部負担金区分);
  }
  if (data.保険種別) {
    shohou.保険種別レコード(data.保険種別);
  }
  shohou.保険者番号レコード(data.保険者番号);
  shohou.記号番号レコード(
    data.被保険者証記号,
    data.被保険者証番号,
    data.被保険者被扶養者,
    data.被保険者証枝番,
  )
  if (data.負担割合 !== undefined) {
    const futan = data.負担割合;
    let 患者負担率;
    let 保険給付率;
    if (futan === 0) {
      患者負担率 = "000";
      保険給付率 = "100";
    } else if (futan > 0 && futan < 10) {
      患者負担率 = `0${futan}0`;
      保険給付率 = `0${10 - futan}0`;
    } else {
      throw new Error(`Invalid 負担割: ${futan}`)
    }
    shohou.負担給付率レコード(患者負担率, 保険給付率);
  }
  if (data.職務上の事由 !== undefined) {
    shohou.職務上の事由レコード(data.職務上の事由);
  }
  if (data.第一公費レコード !== undefined) {
    shohou.第一公費レコード(data.第一公費レコード.公費負担者番号, data.第一公費レコード.公費受給者番号);
  }
  if (data.第二公費レコード !== undefined) {
    shohou.第二公費レコード(data.第二公費レコード.公費負担者番号, data.第二公費レコード.公費受給者番号);
  }
  if (data.第三公費レコード !== undefined) {
    shohou.第三公費レコード(data.第三公費レコード.公費負担者番号, data.第三公費レコード.公費受給者番号);
  }
  if (data.特殊公費レコード !== undefined) {
    shohou.特殊公費レコード(data.特殊公費レコード.公費負担者番号, data.特殊公費レコード.公費受給者番号);
  }
  if (data.レセプト種別コード !== undefined) {
    shohou.レセプト種別レコード(data.レセプト種別コード);
  }
  shohou.処方箋交付年月日レコード(data.処方箋交付年月日);
  if (data.使用期限年月日 !== undefined) {
    shohou.使用期限年月日レコード(data.使用期限年月日);
  }
  if (data.麻薬施用レコード !== undefined) {
    shohou.麻薬施用レコード(
      data.麻薬施用レコード.麻薬施用者免許番号,
      data.麻薬施用レコード.麻薬施用患者住所,
      data.麻薬施用レコード.麻薬施用患者電話番号);
  }
  if (data.残薬確認対応フラグ !== undefined) {
    shohou.残薬確認欄レコード(data.残薬確認対応フラグ);
  }
  if (data.備考レコード !== undefined) {
    data.備考レコード.forEach((rec, i) => {
      let 備考連番 = i + 1;
      let 備考種別: 備考種別 | undefined = undefined;
      let 備考 = rec.備考;
      switch (備考) {
        case "一包化": case "粉砕": {
          備考種別 = 備考;
          break;
        }
      }
      shohou.備考レコード(備考連番, 備考種別, 備考);
    });
  }
  if (data.引換番号 !== undefined) {
    shohou.処方箋番号レコード(data.引換番号);
  }
  data.RP剤情報グループ.forEach((rec, i) => {
    const RP番号 = i + 1;
    {
      const 剤型レコード = rec.剤形レコード;
      if (剤型レコード.剤形区分 === "不明" && 剤型レコード.剤形名称 === undefined) {
        throw new Error(`Invalid 剤型レコード: ${剤型レコード.剤形区分}, ${剤型レコード.剤形名称}`);
      }
      shohou.剤形レコード(RP番号, 剤型レコード.剤形区分, 剤型レコード.剤形名称, 剤型レコード.調剤数量);
    }
    {
      const 用法レコード = rec.用法レコード;
      shohou.用法レコード(RP番号, 用法レコード.用法コード, 用法レコード.用法名称, 用法レコード.用法１日回数);
    }
    {
      if (rec.用法補足レコード !== undefined) {
        rec.用法補足レコード.forEach((hosoku, j) => {
          const RP補足連番 = j + 1;
          shohou.用法補足レコード(RP番号, RP補足連番, hosoku.用法補足区分, hosoku.用法補足情報, undefined, undefined);
        });
      }
    }
    {
      rec.薬品情報グループ.forEach((drug, j) => {
        const RP内連番 = j + 1;
        {
          let drugRec = drug.薬品レコード;
          shohou.薬品レコード(RP番号, RP内連番, drugRec.情報区分, drugRec.薬品コード種別,
            drugRec.薬品コード, drugRec.薬品名称, drugRec.分量, drugRec.力価フラグ, drugRec.単位名);
        }
        {
          if (drug.単位変換レコード !== undefined) {
            shohou.単位変換レコード(RP番号, RP内連番, drug.単位変換レコード);
          }
        }
        {
          if (drug.不均等レコード !== undefined) {
            const f = drug.不均等レコード;
            shohou.不均等レコード(RP番号, RP内連番, f.不均等１回目服用量, f.不均等２回目服用量,
              f.不均等３回目服用量, f.不均等４回目服用量, f.不均等５回目服用量,
            );
          }
        }
        {
          if (drug.負担区分レコード !== undefined) {
            const f = drug.負担区分レコード;
            shohou.負担区分レコード(RP番号, RP内連番, f.第一公費負担区分, f.第二公費負担区分,
              f.第三公費負担区分, f.特殊公費負担区分,
            );
          }
        }
        {
          if (drug.薬品１回服用量レコード !== undefined) {
            const f = drug.薬品１回服用量レコード;
            shohou.薬品１回服用量レコード(RP番号, RP内連番, f.薬剤１回服用量, f.薬剤１日服用回数);
          }
        }
        {
          if (drug.薬品補足レコード !== undefined) {
            drug.薬品補足レコード.forEach((rec, k) => {
              const 薬品補足連番 = k + 1;
              const 薬品補足情報 = rec.薬品補足情報;
              let 薬品補足区分: 薬品補足区分 | undefined = tryCastTo薬品補足区分(薬品補足情報);
              shohou.薬品補足レコード(RP番号, RP内連番, 薬品補足連番, 薬品補足区分, 薬品補足情報);
            })
          }
        }
      });
    }
  });
  if (data.提供情報レコード !== undefined) {
    (data.提供情報レコード.提供診療情報レコード ?? []).forEach((rec, i) => {
      const 提供診療情報連番 = i + 1;
      shohou.提供診療情報レコード(提供診療情報連番, rec.薬品名称, rec.コメント);
    });
    (data.提供情報レコード.検査値データ等レコード ?? []).forEach((rec, i) => {
      const 検査値データ等連番 = i + 1;
      shohou.検査値データ等レコード(検査値データ等連番, rec.検査値データ等);
    });
  }
  return shohou.output();
}

export class PrescInfoWrapper {
  shohou: PrescInfoData;

  constructor(shohou: PrescInfoData) {
    this.shohou = shohou;
  }

  get提供情報レコード(): 提供情報レコード {
    return this.shohou.提供情報レコード ?? {};
  }

  get提供情報レコード_提供診療情報レコード(): 提供診療情報レコード[] {
    return this.get提供情報レコード().提供診療情報レコード ?? [];
  }

  set提供情報レコード_提供診療情報レコード(records: 提供診療情報レコード[]) {
    let var提供情報レコード = Object.assign({}, this.get提供情報レコード(), {
      提供診療情報レコード: records
    });
    this.shohou.提供情報レコード = var提供情報レコード;
  }

  get提供情報レコード_検査値データ等レコード(): 検査値データ等レコード[] {
    return this.get提供情報レコード().検査値データ等レコード ?? [];
  }

  set提供情報レコード_検査値データ等レコード(records: 検査値データ等レコード[]) {
    let var提供情報レコード = Object.assign({}, this.get提供情報レコード(), {
      検査値データ等レコード: records
    });
    this.shohou.提供情報レコード = var提供情報レコード;
  }

  kouhiCount(): number {
    let c = 0;
    const data = this.shohou;
    if (data.第一公費レコード) {
      c += 1;
    }
    if (data.第二公費レコード) {
      c += 1;
    }
    if (data.第三公費レコード) {
      c += 1;
    }
    if (data.特殊公費レコード) {
      c += 1;
    }
    return c;
  }

  hasMixedKouhi(): boolean {
    const data = this.shohou;
    const nkouhi = this.kouhiCount();
    if (nkouhi === 0) {
      return false;
    } else {
      for (let group of data.RP剤情報グループ) {
        for (let drug of group.薬品情報グループ) {
          let ndk = new 薬品情報Wrapper(drug).countKouhi();
          if (ndk !== nkouhi) {
            return true;
          }
        }
      }
      return false;
    }
  }
}

export class 薬品情報Wrapper {
  data: 薬品情報;

  constructor(data: 薬品情報) {
    this.data = data;
  }

  countKouhi(): number {
    let ndk = 0; // drug kouhi count
    const drug = this.data;
    if (drug.負担区分レコード) {
      if (drug.負担区分レコード.第一公費負担区分) {
        ndk += 1;
      }
      if (drug.負担区分レコード.第二公費負担区分) {
        ndk += 1;
      }
      if (drug.負担区分レコード.第三公費負担区分) {
        ndk += 1;
      }
      if (drug.負担区分レコード.特殊公費負担区分) {
        ndk += 1;
      }
    }
    return ndk;
  }
}

export function deepCloneRP剤情報(src: RP剤情報): RP剤情報 {
  const dst: RP剤情報 = Object.assign({}, src, {
    剤形レコード: Object.assign({}, src.剤形レコード),
    用法レコード: Object.assign({}, src.用法レコード),
    薬品情報グループ: src.薬品情報グループ.map(deepClone薬品情報),
  });
  if( src.用法補足レコード ){
    dst.用法補足レコード = src.用法補足レコード.map(deepClone用法補足レコード);
  }
  return dst;
}

export function deepClone薬品情報(src: 薬品情報): 薬品情報 {
  const dst: 薬品情報 = { 薬品レコード: deepClone薬品レコード(src.薬品レコード) };
  if( src.不均等レコード ){
    dst.不均等レコード = deepClone不均等レコード(src.不均等レコード);
  }
  if( src.負担区分レコード ){
    dst.負担区分レコード = deepClone負担区分レコード(src.負担区分レコード);
  }
  if( src.薬品１回服用量レコード ){
    dst.薬品１回服用量レコード = deepClone薬品１回服用量レコード(src.薬品１回服用量レコード);
  }
  if( src.薬品補足レコード ){
    dst.薬品補足レコード = src.薬品補足レコード.map(deepClone薬品補足レコード);
  }
  return dst;
}

export function deepClone用法補足レコード(src: 用法補足レコード): 用法補足レコード {
  return Object.assign({}, src);
}

export function deepClone薬品レコード(src: 薬品レコード): 薬品レコード {
  return Object.assign({}, src);
}

export function deepClone不均等レコード(src: 不均等レコード): 不均等レコード {
  return Object.assign({}, src);
}

export function deepClone負担区分レコード(src: 負担区分レコード): 負担区分レコード {
  return Object.assign({}, src);
}

export function deepClone薬品１回服用量レコード(src: 薬品１回服用量レコード): 薬品１回服用量レコード {
  return Object.assign({}, src);
}

export function deepClone薬品補足レコード(src: 薬品補足レコード): 薬品補足レコード {
  return Object.assign({}, src);
}

export function deepClonePrescInfoData(src: PrescInfoData): PrescInfoData {
  const dst: PrescInfoData = Object.assign({}, src);
  if( src.診療科レコード ){
    dst.診療科レコード = Object.assign({}, src.診療科レコード);
  }
  if( src.第一公費レコード ){
    dst.第一公費レコード = Object.assign({}, src.第一公費レコード);
  }
  if( src.第二公費レコード ){
    dst.第二公費レコード = Object.assign({}, src.第二公費レコード);
  }
  if( src.第三公費レコード ){
    dst.第三公費レコード = Object.assign({}, src.第三公費レコード);
  }
  if( src.特殊公費レコード ){
    dst.特殊公費レコード = Object.assign({}, src.特殊公費レコード);
  }
  if( src.麻薬施用レコード ){
    dst.麻薬施用レコード = Object.assign({}, src.麻薬施用レコード);
  }
  if( src.備考レコード ){
    dst.備考レコード = src.備考レコード.map(bikou => Object.assign({}, bikou));
  }
  dst.RP剤情報グループ = src.RP剤情報グループ.map(deepCloneRP剤情報);
  if( src.提供情報レコード ){
    dst.提供情報レコード = deepClone提供情報レコード(src.提供情報レコード);
  }
  return dst;
}
export function deepClone提供情報レコード(src: 提供情報レコード): 提供情報レコード {
  const dst: 提供情報レコード = {};
  if( src.提供診療情報レコード ) {
    dst.提供診療情報レコード = src.提供診療情報レコード.map(rec => Object.assign({}, rec));
  }
  if( src.検査値データ等レコード ) {
    dst.検査値データ等レコード = src.検査値データ等レコード.map(rec => Object.assign({}, rec));
  }
  return dst;
}




