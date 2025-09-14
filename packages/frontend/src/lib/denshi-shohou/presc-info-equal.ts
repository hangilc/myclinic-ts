import type { 
  薬品情報, 薬品レコード, 不均等レコード, 負担区分レコード, 
  薬品１回服用量レコード, 薬品補足レコード, RP剤情報, 剤形レコード,
  用法レコード, 用法補足レコード, PrescInfoData, 公費レコード,
  麻薬施用レコード, 備考レコード, 提供情報レコード, 提供診療情報レコード,
  検査値データ等レコード
} from "@/lib/denshi-shohou/presc-info";

export function isEqual薬品レコード(a: 薬品レコード, b: 薬品レコード): boolean {
  return a.情報区分 === b.情報区分 &&
    a.薬品コード種別 === b.薬品コード種別 &&
    a.薬品コード === b.薬品コード &&
    a.薬品名称 === b.薬品名称 &&
    a.分量 === b.分量 &&
    a.力価フラグ === b.力価フラグ &&
    a.単位名 === b.単位名;
}

function isEqual不均等レコード(a: 不均等レコード | undefined, b: 不均等レコード | undefined): boolean {
  if (a === undefined && b === undefined) return true;
  if (a === undefined || b === undefined) return false;
  
  return a.不均等１回目服用量 === b.不均等１回目服用量 &&
         a.不均等２回目服用量 === b.不均等２回目服用量 &&
         a.不均等３回目服用量 === b.不均等３回目服用量 &&
         a.不均等４回目服用量 === b.不均等４回目服用量 &&
         a.不均等５回目服用量 === b.不均等５回目服用量;
}

function isEqual負担区分レコード(a: 負担区分レコード | undefined, b: 負担区分レコード | undefined): boolean {
  if (a === undefined && b === undefined) return true;
  if (a === undefined || b === undefined) return false;
  
  return a.第一公費負担区分 === b.第一公費負担区分 &&
         a.第二公費負担区分 === b.第二公費負担区分 &&
         a.第三公費負担区分 === b.第三公費負担区分 &&
         a.特殊公費負担区分 === b.特殊公費負担区分;
}

function isEqual薬品１回服用量レコード(a: 薬品１回服用量レコード | undefined, b: 薬品１回服用量レコード | undefined): boolean {
  if (a === undefined && b === undefined) return true;
  if (a === undefined || b === undefined) return false;
  
  return a.薬剤１回服用量 === b.薬剤１回服用量 &&
         a.薬剤１日服用回数 === b.薬剤１日服用回数;
}

function isEqual薬品補足レコード配列(a: 薬品補足レコード[] | undefined, b: 薬品補足レコード[] | undefined): boolean {
  if (a === undefined && b === undefined) return true;
  if (a === undefined || b === undefined) return false;
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    if (a[i].薬品補足情報 !== b[i].薬品補足情報) {
      return false;
    }
  }
  return true;
}

export function isEqual薬品情報(a: 薬品情報, b: 薬品情報): boolean {
  return isEqual薬品レコード(a.薬品レコード, b.薬品レコード) &&
         a.単位変換レコード === b.単位変換レコード &&
         isEqual不均等レコード(a.不均等レコード, b.不均等レコード) &&
         isEqual負担区分レコード(a.負担区分レコード, b.負担区分レコード) &&
         isEqual薬品１回服用量レコード(a.薬品１回服用量レコード, b.薬品１回服用量レコード) &&
         isEqual薬品補足レコード配列(a.薬品補足レコード, b.薬品補足レコード);
}

function isEqual剤形レコード(a: 剤形レコード, b: 剤形レコード): boolean {
  return a.剤形区分 === b.剤形区分 &&
         a.剤形名称 === b.剤形名称 &&
         a.調剤数量 === b.調剤数量;
}

function isEqual用法レコード(a: 用法レコード, b: 用法レコード): boolean {
  return a.用法コード === b.用法コード &&
         a.用法名称 === b.用法名称 &&
         a.用法１日回数 === b.用法１日回数;
}

function isEqual用法補足レコード(a: 用法補足レコード, b: 用法補足レコード): boolean {
  return a.用法補足区分 === b.用法補足区分 &&
         a.用法補足情報 === b.用法補足情報;
}

function isEqual用法補足レコード配列(a: 用法補足レコード[] | undefined, b: 用法補足レコード[] | undefined): boolean {
  if (a === undefined && b === undefined) return true;
  if (a === undefined || b === undefined) return false;
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    if (!isEqual用法補足レコード(a[i], b[i])) {
      return false;
    }
  }
  return true;
}

function isEqual薬品情報配列(a: 薬品情報[], b: 薬品情報[]): boolean {
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    if (!isEqual薬品情報(a[i], b[i])) {
      return false;
    }
  }
  return true;
}

export function isEqualRP剤情報(a: RP剤情報, b: RP剤情報): boolean {
  return isEqual剤形レコード(a.剤形レコード, b.剤形レコード) &&
         isEqual用法レコード(a.用法レコード, b.用法レコード) &&
         isEqual用法補足レコード配列(a.用法補足レコード, b.用法補足レコード) &&
         isEqual薬品情報配列(a.薬品情報グループ, b.薬品情報グループ);
}

function isEqual公費レコード(a: 公費レコード | undefined, b: 公費レコード | undefined): boolean {
  if (a === undefined && b === undefined) return true;
  if (a === undefined || b === undefined) return false;
  
  return a.公費負担者番号 === b.公費負担者番号 &&
         a.公費受給者番号 === b.公費受給者番号;
}

function isEqual麻薬施用レコード(a: 麻薬施用レコード | undefined, b: 麻薬施用レコード | undefined): boolean {
  if (a === undefined && b === undefined) return true;
  if (a === undefined || b === undefined) return false;
  
  return a.麻薬施用者免許番号 === b.麻薬施用者免許番号 &&
         a.麻薬施用患者住所 === b.麻薬施用患者住所 &&
         a.麻薬施用患者電話番号 === b.麻薬施用患者電話番号;
}

function isEqual備考レコード(a: 備考レコード, b: 備考レコード): boolean {
  return a.備考 === b.備考;
}

function isEqual備考レコード配列(a: 備考レコード[] | undefined, b: 備考レコード[] | undefined): boolean {
  if (a === undefined && b === undefined) return true;
  if (a === undefined || b === undefined) return false;
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    if (!isEqual備考レコード(a[i], b[i])) {
      return false;
    }
  }
  return true;
}

function isEqual提供診療情報レコード(a: 提供診療情報レコード, b: 提供診療情報レコード): boolean {
  return a.薬品名称 === b.薬品名称 &&
         a.コメント === b.コメント;
}

function isEqual提供診療情報レコード配列(a: 提供診療情報レコード[] | undefined, b: 提供診療情報レコード[] | undefined): boolean {
  if (a === undefined && b === undefined) return true;
  if (a === undefined || b === undefined) return false;
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    if (!isEqual提供診療情報レコード(a[i], b[i])) {
      return false;
    }
  }
  return true;
}

function isEqual検査値データ等レコード(a: 検査値データ等レコード, b: 検査値データ等レコード): boolean {
  return a.検査値データ等 === b.検査値データ等;
}

function isEqual検査値データ等レコード配列(a: 検査値データ等レコード[] | undefined, b: 検査値データ等レコード[] | undefined): boolean {
  if (a === undefined && b === undefined) return true;
  if (a === undefined || b === undefined) return false;
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    if (!isEqual検査値データ等レコード(a[i], b[i])) {
      return false;
    }
  }
  return true;
}

function isEqual提供情報レコード(a: 提供情報レコード | undefined, b: 提供情報レコード | undefined): boolean {
  if (a === undefined && b === undefined) return true;
  if (a === undefined || b === undefined) return false;
  
  return isEqual提供診療情報レコード配列(a.提供診療情報レコード, b.提供診療情報レコード) &&
         isEqual検査値データ等レコード配列(a.検査値データ等レコード, b.検査値データ等レコード);
}

function isEqualRP剤情報配列(a: RP剤情報[], b: RP剤情報[]): boolean {
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    if (!isEqualRP剤情報(a[i], b[i])) {
      return false;
    }
  }
  return true;
}

export function isEqualPrescInfoData(a: PrescInfoData, b: PrescInfoData): boolean {
  return a.医療機関コード種別 === b.医療機関コード種別 &&
         a.医療機関コード === b.医療機関コード &&
         a.医療機関都道府県コード === b.医療機関都道府県コード &&
         a.医療機関名称 === b.医療機関名称 &&
         a.医療機関郵便番号 === b.医療機関郵便番号 &&
         a.医療機関所在地 === b.医療機関所在地 &&
         a.医療機関電話番号 === b.医療機関電話番号 &&
         a.ＦＡＸ番号 === b.ＦＡＸ番号 &&
         a.その他連絡先 === b.その他連絡先 &&
         (a.診療科レコード === b.診療科レコード || 
          (a.診療科レコード !== undefined && b.診療科レコード !== undefined &&
           a.診療科レコード.診療科コード種別 === b.診療科レコード.診療科コード種別 &&
           a.診療科レコード.診療科コード === b.診療科レコード.診療科コード)) &&
         a.医師コード === b.医師コード &&
         a.医師カナ氏名 === b.医師カナ氏名 &&
         a.医師漢字氏名 === b.医師漢字氏名 &&
         a.患者コード === b.患者コード &&
         a.患者漢字氏名 === b.患者漢字氏名 &&
         a.患者カナ氏名 === b.患者カナ氏名 &&
         a.患者性別 === b.患者性別 &&
         a.患者生年月日 === b.患者生年月日 &&
         a.保険一部負担金区分 === b.保険一部負担金区分 &&
         a.保険種別 === b.保険種別 &&
         a.保険者番号 === b.保険者番号 &&
         a.被保険者証記号 === b.被保険者証記号 &&
         a.被保険者証番号 === b.被保険者証番号 &&
         a.被保険者被扶養者 === b.被保険者被扶養者 &&
         a.被保険者証枝番 === b.被保険者証枝番 &&
         a.負担割合 === b.負担割合 &&
         a.職務上の事由 === b.職務上の事由 &&
         isEqual公費レコード(a.第一公費レコード, b.第一公費レコード) &&
         isEqual公費レコード(a.第二公費レコード, b.第二公費レコード) &&
         isEqual公費レコード(a.第三公費レコード, b.第三公費レコード) &&
         isEqual公費レコード(a.特殊公費レコード, b.特殊公費レコード) &&
         a.レセプト種別コード === b.レセプト種別コード &&
         a.処方箋交付年月日 === b.処方箋交付年月日 &&
         a.使用期限年月日 === b.使用期限年月日 &&
         isEqual麻薬施用レコード(a.麻薬施用レコード, b.麻薬施用レコード) &&
         a.残薬確認対応フラグ === b.残薬確認対応フラグ &&
         isEqual備考レコード配列(a.備考レコード, b.備考レコード) &&
         a.引換番号 === b.引換番号 &&
         isEqualRP剤情報配列(a.RP剤情報グループ, b.RP剤情報グループ) &&
         isEqual提供情報レコード(a.提供情報レコード, b.提供情報レコード);
}

