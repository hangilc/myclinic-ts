import { DenshiShohou, 診療科コードMap, type 点数表, type 診療科コード, type 診療科コード種別, type 都道府県, type 性別コード, type 保険一部負担金区分コード, type 保険種別コード, type 被保険者等種別, type 職務上の事由コード, type 残薬確認対応フラグ, type 備考種別, 備考種別Map, type 剤形区分, type 用法補足区分, type 情報区分, type 薬品コード種別, type 力価フラグ, type 薬品補足区分, tryCastTo薬品補足区分, type 都道府県コード } from "./denshi-shohou";

export interface 公費レコード {
  公費負担者番号: string;
  公費受給者番号?: string;
}

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
  用法コード?: string;
  用法名称: string;
  用法１日回数?: number;
}

export interface 用法補足レコード {
  用法補足区分?: 用法補足区分;
  用法補足情報: string;
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
          if( drug.薬品１回服用量レコード !== undefined ){
            const f = drug.薬品１回服用量レコード;
            shohou.薬品１回服用量レコード(RP番号, RP内連番, f.薬剤１回服用量, f.薬剤１日服用回数);
          }
        }
        {
          if( drug.薬品補足レコード !== undefined ){
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
  if( data.提供情報レコード !== undefined ){
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







