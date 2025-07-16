import type {
  薬品レコード, 薬品情報, 不均等レコード, 負担区分レコード, 薬品１回服用量レコード, 薬品補足レコード,
  RP剤情報, 剤形レコード, 用法レコード, 用法補足レコード, 提供診療情報レコード, 検査値データ等レコード, 提供情報レコード,
  PrescInfoData, 公費レコード, 麻薬施用レコード, 備考レコード,
} from "@/lib/denshi-shohou/presc-info";
import type {
  剤形区分, 用法補足区分, 情報区分, 薬品コード種別, 力価フラグ,
  点数表, 都道府県コード, 診療科コード種別, 診療科コード, 性別コード, 保険一部負担金区分コード, 保険種別コード, 被保険者等種別,
  職務上の事由コード, 残薬確認対応フラグ
} from "@/lib/denshi-shohou/denshi-shohou";

let serialId = 1;

function nextId(): number {
  return serialId++;
}

export class 薬品レコードEdit implements 薬品レコード {
  情報区分: 情報区分;
  薬品コード種別: 薬品コード種別;
  薬品コード: string;
  薬品名称: string;
  分量: string;
  力価フラグ: 力価フラグ;
  単位名: string;

  constructor(src: {
    情報区分: 情報区分;
    薬品コード種別: 薬品コード種別;
    薬品コード: string;
    薬品名称: string;
    分量: string;
    力価フラグ: 力価フラグ;
    単位名: string;
  }) {
    this.情報区分 = src.情報区分;
    this.薬品コード種別 = src.薬品コード種別;
    this.薬品コード = src.薬品コード;
    this.薬品名称 = src.薬品名称;
    this.分量 = src.分量;
    this.力価フラグ = src.力価フラグ;
    this.単位名 = src.単位名;
  }

  static fromObject(obj: 薬品レコード): 薬品レコードEdit {
    return new 薬品レコードEdit(obj);
  }

  clone(): 薬品レコードEdit {
    return new 薬品レコードEdit(this);
  }

  assign(src: 薬品レコードEdit): void {
    Object.assign(this, src);
  }
}

export class 不均等レコードEdit implements 不均等レコード {
  不均等１回目服用量: string;
  不均等２回目服用量: string;
  不均等３回目服用量?: string;
  不均等４回目服用量?: string;
  不均等５回目服用量?: string;

  constructor(src: {
    不均等１回目服用量: string;
    不均等２回目服用量: string;
    不均等３回目服用量?: string;
    不均等４回目服用量?: string;
    不均等５回目服用量?: string;
  }) {
    this.不均等１回目服用量 = src.不均等１回目服用量;
    this.不均等２回目服用量 = src.不均等２回目服用量;
    this.不均等３回目服用量 = src.不均等３回目服用量;
    this.不均等４回目服用量 = src.不均等４回目服用量;
    this.不均等５回目服用量 = src.不均等５回目服用量;
  }

  static fromObject(obj: 不均等レコード): 不均等レコードEdit {
    return new 不均等レコードEdit(obj);
  }

  clone(): 不均等レコードEdit {
    return new 不均等レコードEdit(this);
  }

  assign(src: 不均等レコードEdit): void {
    Object.assign(this, src);
  }
}

export class 負担区分レコードEdit implements 負担区分レコード {
  第一公費負担区分?: boolean;
  第二公費負担区分?: boolean;
  第三公費負担区分?: boolean;
  特殊公費負担区分?: boolean;

  constructor(src: {
    第一公費負担区分?: boolean;
    第二公費負担区分?: boolean;
    第三公費負担区分?: boolean;
    特殊公費負担区分?: boolean;
  }) {
    this.第一公費負担区分 = src.第一公費負担区分;
    this.第二公費負担区分 = src.第二公費負担区分;
    this.第三公費負担区分 = src.第三公費負担区分;
    this.特殊公費負担区分 = src.特殊公費負担区分;
  }

  static fromObject(obj: 負担区分レコード): 負担区分レコードEdit {
    return new 負担区分レコードEdit(obj);
  }

  clone(): 負担区分レコードEdit {
    return new 負担区分レコードEdit(this);
  }

  assign(src: 負担区分レコードEdit): void {
    Object.assign(this, src);
  }
}

export class 薬品１回服用量レコードEdit implements 薬品１回服用量レコード {
  薬剤１回服用量: string;
  薬剤１日服用回数?: number;

  constructor(src: {
    薬剤１回服用量: string;
    薬剤１日服用回数?: number;
  }) {
    this.薬剤１回服用量 = src.薬剤１回服用量;
    this.薬剤１日服用回数 = src.薬剤１日服用回数;
  }

  static fromObject(obj: 薬品１回服用量レコード): 薬品１回服用量レコードEdit {
    return new 薬品１回服用量レコードEdit(obj);
  }

  clone(): 薬品１回服用量レコードEdit {
    return new 薬品１回服用量レコードEdit(this);
  }

  assign(src: 薬品１回服用量レコードEdit): void {
    Object.assign(this, src);
  }
}

export class 薬品補足レコードEdit implements 薬品補足レコード {
  id: number;
  薬品補足情報: string;

  constructor(src: {
    薬品補足情報: string;
  }, id: number) {
    this.id = id;
    this.薬品補足情報 = src.薬品補足情報;
  }

  static fromObject(obj: 薬品補足レコード): 薬品補足レコードEdit {
    return new 薬品補足レコードEdit(obj, nextId());
  }

  clone(): 薬品補足レコードEdit {
    return new 薬品補足レコードEdit(this, this.id);
  }

  assign(src: 薬品補足レコードEdit): void {
    this.薬品補足情報 = src.薬品補足情報;
  }
}

export class 薬品情報Edit implements 薬品情報 {
  id: number;
  薬品レコード: 薬品レコードEdit;
  単位変換レコード?: string;
  不均等レコード?: 不均等レコードEdit;
  負担区分レコード?: 負担区分レコードEdit;
  薬品１回服用量レコード?: 薬品１回服用量レコードEdit;
  薬品補足レコード?: 薬品補足レコードEdit[];

  constructor(src: {
    薬品レコード: 薬品レコードEdit;
    単位変換レコード?: string;
    不均等レコード?: 不均等レコードEdit;
    負担区分レコード?: 負担区分レコードEdit;
    薬品１回服用量レコード?: 薬品１回服用量レコードEdit;
    薬品補足レコード?: 薬品補足レコードEdit[];
  }, id: number) {
    this.id = id;
    this.薬品レコード = src.薬品レコード;
    this.単位変換レコード = src.単位変換レコード;
    this.不均等レコード = src.不均等レコード;
    this.負担区分レコード = src.負担区分レコード;
    this.薬品１回服用量レコード = src.薬品１回服用量レコード;
    this.薬品補足レコード = src.薬品補足レコード;
  }

  static fromObject(obj: 薬品情報): 薬品情報Edit {
    return new 薬品情報Edit({
      薬品レコード: 薬品レコードEdit.fromObject(obj.薬品レコード),
      単位変換レコード: obj.単位変換レコード,
      不均等レコード: obj.不均等レコード ? 不均等レコードEdit.fromObject(obj.不均等レコード) : undefined,
      負担区分レコード: obj.負担区分レコード ? 負担区分レコードEdit.fromObject(obj.負担区分レコード) : undefined,
      薬品１回服用量レコード: obj.薬品１回服用量レコード ? 薬品１回服用量レコードEdit.fromObject(obj.薬品１回服用量レコード) : undefined,
      薬品補足レコード: obj.薬品補足レコード?.map(record => 薬品補足レコードEdit.fromObject(record))
    }, nextId());
  }

  clone(): 薬品情報Edit {
    return new 薬品情報Edit({
      薬品レコード: this.薬品レコード.clone(),
      単位変換レコード: this.単位変換レコード,
      不均等レコード: this.不均等レコード?.clone(),
      負担区分レコード: this.負担区分レコード?.clone(),
      薬品１回服用量レコード: this.薬品１回服用量レコード?.clone(),
      薬品補足レコード: this.薬品補足レコード?.map(record => record.clone())
    }, this.id);
  }

  assign(src: 薬品情報Edit): void {
    this.薬品レコード = src.薬品レコード;
    this.単位変換レコード = src.単位変換レコード;
    this.不均等レコード = src.不均等レコード;
    this.負担区分レコード = src.負担区分レコード;
    this.薬品１回服用量レコード = src.薬品１回服用量レコード;
    this.薬品補足レコード = src.薬品補足レコード;
  }

}

export class 剤形レコードEdit implements 剤形レコード {
  剤形区分: 剤形区分;
  剤形名称?: string;
  調剤数量: number;

  constructor(src: {
    剤形区分: 剤形区分;
    剤形名称?: string;
    調剤数量: number;
  }) {
    this.剤形区分 = src.剤形区分;
    this.剤形名称 = src.剤形名称;
    this.調剤数量 = src.調剤数量;
  }

  static fromObject(obj: 剤形レコード): 剤形レコードEdit {
    return new 剤形レコードEdit(obj);
  }

  clone(): 剤形レコードEdit {
    return new 剤形レコードEdit(this);
  }

  assign(src: 剤形レコードEdit): void {
    Object.assign(this, src);
  }
}

export class 用法レコードEdit implements 用法レコード {
  用法コード: string;
  用法名称: string;
  用法１日回数?: number;

  constructor(src: {
    用法コード: string;
    用法名称: string;
    用法１日回数?: number;
  }) {
    this.用法コード = src.用法コード;
    this.用法名称 = src.用法名称;
    this.用法１日回数 = src.用法１日回数;
  }

  static fromObject(obj: 用法レコード): 用法レコードEdit {
    return new 用法レコードEdit(obj);
  }

  clone(): 用法レコードEdit {
    return new 用法レコードEdit(this);
  }

  assign(src: 用法レコードEdit): void {
    Object.assign(this, src);
  }
}

export class 用法補足レコードEdit implements 用法補足レコード {
  用法補足区分?: 用法補足区分;
  用法補足情報: string;

  constructor(src: {
    用法補足区分?: 用法補足区分;
    用法補足情報: string;
  }) {
    this.用法補足区分 = src.用法補足区分;
    this.用法補足情報 = src.用法補足情報;
  }

  static fromObject(obj: 用法補足レコード): 用法補足レコードEdit {
    return new 用法補足レコードEdit(obj);
  }

  clone(): 用法補足レコードEdit {
    return new 用法補足レコードEdit(this);
  }

  assign(src: 用法補足レコードEdit): void {
    Object.assign(this, src);
  }
}

export class RP剤情報Edit implements RP剤情報 {
  id: number;
  剤形レコード: 剤形レコードEdit;
  用法レコード: 用法レコードEdit;
  用法補足レコード?: 用法補足レコードEdit[];
  薬品情報グループ: 薬品情報Edit[];

  constructor(src: {
    剤形レコード: 剤形レコードEdit;
    用法レコード: 用法レコードEdit;
    用法補足レコード?: 用法補足レコードEdit[];
    薬品情報グループ: 薬品情報Edit[];
  }, id: number) {
    this.id = id;
    this.剤形レコード = src.剤形レコード;
    this.用法レコード = src.用法レコード;
    this.用法補足レコード = src.用法補足レコード;
    this.薬品情報グループ = src.薬品情報グループ;
  }

  static fromObject(obj: RP剤情報): RP剤情報Edit {
    return new RP剤情報Edit({
      剤形レコード: 剤形レコードEdit.fromObject(obj.剤形レコード),
      用法レコード: 用法レコードEdit.fromObject(obj.用法レコード),
      用法補足レコード: obj.用法補足レコード?.map(record => 用法補足レコードEdit.fromObject(record)),
      薬品情報グループ: obj.薬品情報グループ.map(info => 薬品情報Edit.fromObject(info))
    }, nextId());
  }

  clone(): RP剤情報Edit {
    return new RP剤情報Edit({
      剤形レコード: this.剤形レコード.clone(),
      用法レコード: this.用法レコード.clone(),
      用法補足レコード: this.用法補足レコード?.map(record => record.clone()),
      薬品情報グループ: this.薬品情報グループ.map(info => info.clone())
    }, this.id);
  }

  assign(src: RP剤情報Edit): void {
    this.剤形レコード = src.剤形レコード;
    this.用法レコード = src.用法レコード;
    this.用法補足レコード = src.用法補足レコード;
    this.薬品情報グループ = src.薬品情報グループ;
  }
}
