// export interface PrescInfoData {
//   医療機関コード種別: 点数表;
//   医療機関コード: string;
//   医療機関都道府県コード: 都道府県コード;
//   医療機関名称: string;
//   医療機関郵便番号?: string;
//   医療機関所在地: string;
//   医療機関電話番号: string;
//   ＦＡＸ番号?: string;
//   その他連絡先?: string;
//   診療科レコード?: {
//     診療科コード種別: 診療科コード種別;
//     診療科コード: 診療科コード;
//   },
//   医師コード?: string;
//   医師カナ氏名?: string;
//   医師漢字氏名: string; // 姓と名は全角スペースで区切る。
//   患者コード?: string;
//   患者漢字氏名: string; // 性と名は全角スペースで区切る。
//   患者カナ氏名: string; // 半角カナで記録する。姓と名は半角スペースで区切る。
//   患者性別: 性別コード;
//   患者生年月日: string;
//   保険一部負担金区分?: 保険一部負担金区分コード;
//   保険種別?: 保険種別コード;
//   保険者番号: string;
//   被保険者証記号?: string;
//   被保険者証番号: string;
//   被保険者被扶養者: 被保険者等種別;
//   被保険者証枝番?: string;
//   負担割合?: number; // 患者負担割合
//   職務上の事由?: 職務上の事由コード;
//   第一公費レコード?: 公費レコード;
//   第二公費レコード?: 公費レコード;
//   第三公費レコード?: 公費レコード;
//   特殊公費レコード?: 公費レコード;
//   レセプト種別コード?: string;
//   処方箋交付年月日: string;
//   使用期限年月日?: string;
//   麻薬施用レコード?: 麻薬施用レコード;
//   残薬確認対応フラグ?: 残薬確認対応フラグ;
//   備考レコード?: 備考レコード[];
//   引換番号?: string;
//   RP剤情報グループ: RP剤情報[];
//   提供情報レコード?: 提供情報レコード;
// }

import type { RP剤情報, 備考レコード, 提供情報レコード } from "@/lib/denshi-shohou/presc-info";
import type { Shohou } from "@/lib/parse-shohou";
import { DateWrapper } from "myclinic-util";

export interface ConvData1 {
  使用期限年月日?: string;
  備考レコード?: 備考レコード[];
  提供情報レコード?: 提供情報レコード;
}

export async function createPrescInfo(
  visitId: number, data1: ConvData1, RP剤情報グループ: RP剤情報[]
): Promise<PrescInfoData> {

}

export function getConvData1(shohou: Shohou): ConvData1 {
  let kigen: string | undefined = undefined;
  if (shohou.kigen) {
    kigen = DateWrapper.from(shohou.kigen)
      .asSqlDate()
      .replaceAll(/-/g, "");
  }
  return {
    使用期限年月日: kigen,
  }
}