import { DenshiShohou, 診療科コードMap, type 点数表, type 診療科コード, type 診療科コード種別, type 都道府県, type 性別コード, type 保険一部負担金区分コード, type 保険種別コード, type 被保険者等種別, type 職務上の事由コード } from "./denshi-shohou";

export interface 公費レコード {
  公費負担者番号: string;
  公費受給者番号?: string;
}

export interface PrescInfoData {
  医療機関コード種別: 点数表;
  医療機関コード: string;
  医療機関都道府県コード: 都道府県;
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
  if( data.負担割合 !== undefined ){
    const futan = data.負担割合;
    let 患者負担率;
    let 保険給付率;
    if( futan === 0 ){
      患者負担率 = "000";
      保険給付率 = "100";
    } else if( futan > 0 && futan < 10 ) {
      患者負担率 = `0${futan}0`;
      保険給付率 = `0${10-futan}0`;
    } else {
      throw new Error(`Invalid 負担割: ${futan}`)
    }
    shohou.負担給付率レコード(患者負担率, 保険給付率);
  }
  if( data.職務上の事由 !== undefined ){
    shohou.職務上の事由レコード(data.職務上の事由);
  }
  if( data.第一公費レコード !== undefined ){
    shohou.第一公費レコード(data.第一公費レコード.公費負担者番号, data.第一公費レコード.公費受給者番号);
  }
  if( data.第二公費レコード !== undefined ){
    shohou.第二公費レコード(data.第二公費レコード.公費負担者番号, data.第二公費レコード.公費受給者番号);
  }
  if( data.第三公費レコード !== undefined ){
    shohou.第三公費レコード(data.第三公費レコード.公費負担者番号, data.第三公費レコード.公費受給者番号);
  }
  if( data.特殊公費レコード !== undefined ){
    shohou.特殊公費レコード(data.特殊公費レコード.公費負担者番号, data.特殊公費レコード.公費受給者番号);
  }
  if( data.レセプト種別コード !== undefined ){
    shohou.レセプト種別レコード(data.レセプト種別コード);
  }
  return shohou.output();
}

