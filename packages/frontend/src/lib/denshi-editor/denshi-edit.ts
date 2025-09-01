import type {
  保険一部負担金区分コード,
  保険種別コード,
  剤形区分,
  力価フラグ,
  性別コード,
  情報区分,
  残薬確認対応フラグ,
  点数表,
  用法補足区分,
  職務上の事由コード,
  薬品コード種別,
  被保険者等種別,
  診療科コード,
  診療科コード種別,
  都道府県コード,
} from "@/lib/denshi-shohou/denshi-shohou";
import type {
  PrescInfoData,
  RP剤情報,
  不均等レコード,
  備考レコード,
  公費レコード,
  剤形レコード,
  提供情報レコード,
  提供診療情報レコード,
  検査値データ等レコード,
  用法レコード,
  用法補足レコード,
  薬品レコード,
  薬品情報,
  薬品補足レコード,
  薬品１回服用量レコード,
  負担区分レコード,
  麻薬施用レコード,
} from "@/lib/denshi-shohou/presc-info";
import { isEqualRP剤情報 } from "../denshi-shohou/presc-info-equal";

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
  isEditing情報区分: boolean;
  isEditing薬品コード: boolean;
  isEditing分量: boolean;

  constructor(
    src: {
      情報区分: 情報区分;
      薬品コード種別: 薬品コード種別;
      薬品コード: string;
      薬品名称: string;
      分量: string;
      力価フラグ: 力価フラグ;
      単位名: string;
    },
    aux: {
      isEditing情報区分: boolean;
      isEditing薬品コード: boolean;
      isEditing分量: boolean;
    }
  ) {
    this.情報区分 = src.情報区分;
    this.薬品コード種別 = src.薬品コード種別;
    this.薬品コード = src.薬品コード;
    this.薬品名称 = src.薬品名称;
    this.分量 = src.分量;
    this.力価フラグ = src.力価フラグ;
    this.単位名 = src.単位名;
    this.isEditing情報区分 = aux.isEditing情報区分;
    this.isEditing薬品コード = aux.isEditing薬品コード;
    this.isEditing分量 = aux.isEditing分量;
  }

  static fromObject(obj: 薬品レコード): 薬品レコードEdit {
    return new 薬品レコードEdit(obj, {
      isEditing情報区分: false,
      isEditing薬品コード: false,
      isEditing分量: false,
    });
  }

  clone(): 薬品レコードEdit {
    return new 薬品レコードEdit(this, this);
  }

  toObject(): 薬品レコード {
    return Object.assign(
      {},
      {
        情報区分: this.情報区分,
        薬品コード種別: this.薬品コード種別,
        薬品コード: this.薬品コード,
        薬品名称: this.薬品名称,
        分量: this.分量,
        力価フラグ: this.力価フラグ,
        単位名: this.単位名,
      }
    );
  }

  isEditing(): boolean {
    return (
      this.isEditing情報区分 || this.isEditing薬品コード || this.isEditing分量
    );
  }

  clearEditingFlags() {
    this.isEditing情報区分 = false;
    this.isEditing薬品コード = false;
    this.isEditing分量 = false;
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

  static fromOptionalObject(
    obj: 不均等レコード | undefined
  ): 不均等レコードEdit | undefined {
    if (obj === undefined) {
      return undefined;
    } else {
      return 不均等レコードEdit.fromObject(obj);
    }
  }

  clone(): 不均等レコードEdit {
    return new 不均等レコードEdit(this);
  }

  toObject(): 不均等レコード {
    let obj: 不均等レコード = Object.assign(
      {},
      {
        不均等１回目服用量: this.不均等１回目服用量,
        不均等２回目服用量: this.不均等２回目服用量,
      }
    );
    if (this.不均等３回目服用量) {
      obj.不均等３回目服用量 = this.不均等３回目服用量;
    }
    if (this.不均等４回目服用量) {
      obj.不均等４回目服用量 = this.不均等４回目服用量;
    }
    if (this.不均等５回目服用量) {
      obj.不均等５回目服用量 = this.不均等５回目服用量;
    }
    return obj;
  }
}

export class 負担区分レコードEdit implements 負担区分レコード {
  第一公費負担区分?: boolean;
  第二公費負担区分?: boolean;
  第三公費負担区分?: boolean;
  特殊公費負担区分?: boolean;
  isEditing第一公費負担区分: boolean;
  isEditing第二公費負担区分: boolean;
  isEditing第三公費負担区分: boolean;
  isEditing特殊公費負担区分: boolean;

  constructor(
    src: {
      第一公費負担区分?: boolean;
      第二公費負担区分?: boolean;
      第三公費負担区分?: boolean;
      特殊公費負担区分?: boolean;
    },
    aux: {
      isEditing第一公費負担区分: boolean;
      isEditing第二公費負担区分: boolean;
      isEditing第三公費負担区分: boolean;
      isEditing特殊公費負担区分: boolean;
    }
  ) {
    this.第一公費負担区分 = src.第一公費負担区分;
    this.第二公費負担区分 = src.第二公費負担区分;
    this.第三公費負担区分 = src.第三公費負担区分;
    this.特殊公費負担区分 = src.特殊公費負担区分;
    this.isEditing第一公費負担区分 = aux.isEditing第一公費負担区分;
    this.isEditing第二公費負担区分 = aux.isEditing第二公費負担区分;
    this.isEditing第三公費負担区分 = aux.isEditing第三公費負担区分;
    this.isEditing特殊公費負担区分 = aux.isEditing特殊公費負担区分;
  }

  static fromObject(obj: 負担区分レコード): 負担区分レコードEdit {
    return new 負担区分レコードEdit(obj, {
      isEditing第一公費負担区分: false,
      isEditing第二公費負担区分: false,
      isEditing第三公費負担区分: false,
      isEditing特殊公費負担区分: false,
    });
  }

  clone(): 負担区分レコードEdit {
    return new 負担区分レコードEdit(this, this);
  }

  toObject(): 負担区分レコード | undefined {
    if (
      this.第一公費負担区分 === undefined &&
      this.第二公費負担区分 === undefined &&
      this.第三公費負担区分 === undefined &&
      this.特殊公費負担区分 === undefined
    ) {
      return undefined;
    }
    let obj: 負担区分レコード = {};
    if (this.第一公費負担区分 !== undefined) {
      obj.第一公費負担区分 = this.第一公費負担区分;
    }
    if (this.第二公費負担区分 !== undefined) {
      obj.第二公費負担区分 = this.第二公費負担区分;
    }
    if (this.第三公費負担区分 !== undefined) {
      obj.第三公費負担区分 = this.第三公費負担区分;
    }
    if (this.特殊公費負担区分 !== undefined) {
      obj.特殊公費負担区分 = this.特殊公費負担区分;
    }
    return obj;
  }

  isEditing(): boolean {
    return (
      this.isEditing第一公費負担区分 ||
      this.isEditing第二公費負担区分 ||
      this.isEditing第三公費負担区分 ||
      this.isEditing特殊公費負担区分
    );
  }

  clearEditingFlags() {
    this.isEditing第一公費負担区分 = false;
    this.isEditing第二公費負担区分 = false;
    this.isEditing第三公費負担区分 = false;
    this.isEditing特殊公費負担区分 = false;
  }
}

export class 薬品１回服用量レコードEdit implements 薬品１回服用量レコード {
  薬剤１回服用量: string;
  薬剤１日服用回数?: number;

  constructor(src: { 薬剤１回服用量: string; 薬剤１日服用回数?: number }) {
    this.薬剤１回服用量 = src.薬剤１回服用量;
    this.薬剤１日服用回数 = src.薬剤１日服用回数;
  }

  static fromObject(obj: 薬品１回服用量レコード): 薬品１回服用量レコードEdit {
    return new 薬品１回服用量レコードEdit(obj);
  }

  clone(): 薬品１回服用量レコードEdit {
    return new 薬品１回服用量レコードEdit(this);
  }

  toObject(): 薬品１回服用量レコード {
    let obj: 薬品１回服用量レコード = {
      薬剤１回服用量: this.薬剤１回服用量,
    };
    if (this.薬剤１日服用回数 !== undefined) {
      obj.薬剤１日服用回数 = this.薬剤１日服用回数;
    }
    return obj;
  }
}

export class 薬品補足レコードEdit implements 薬品補足レコード {
  薬品補足情報: string;
  id: number;
  isEditing: boolean;

  constructor(
    src: {
      薬品補足情報: string;
    },
    aux: { id: number; isEditing: boolean }
  ) {
    this.薬品補足情報 = src.薬品補足情報;
    this.id = aux.id;
    this.isEditing = aux.isEditing;
  }

  static fromObject(obj: 薬品補足レコード): 薬品補足レコードEdit {
    return new 薬品補足レコードEdit(obj, { id: nextId(), isEditing: false });
  }

  static fromInfo(薬品補足情報: string): 薬品補足レコードEdit {
    return 薬品補足レコードEdit.fromObject({ 薬品補足情報 });
  }

  clone(): 薬品補足レコードEdit {
    return new 薬品補足レコードEdit(this, this);
  }

  toObject(): 薬品補足レコード {
    return {
      薬品補足情報: this.薬品補足情報,
    };
  }

  clearEditingFlags() {
    this.isEditing = false;
  }
}

export class 薬品情報Edit implements 薬品情報 {
  薬品レコード: 薬品レコードEdit;
  単位変換レコード?: string;
  不均等レコード?: 不均等レコードEdit;
  負担区分レコード?: 負担区分レコードEdit;
  薬品１回服用量レコード?: 薬品１回服用量レコードEdit;
  薬品補足レコード?: 薬品補足レコードEdit[];
  id: number;
  ippanmei: string;
  ippanmeicode: string;
  isEditing不均等レコード: boolean;
  isSelected: boolean;

  constructor(
    src: {
      薬品レコード: 薬品レコードEdit;
      単位変換レコード?: string;
      不均等レコード?: 不均等レコードEdit;
      負担区分レコード?: 負担区分レコードEdit;
      薬品１回服用量レコード?: 薬品１回服用量レコードEdit;
      薬品補足レコード?: 薬品補足レコードEdit[];
    },
    aux: {
      id: number;
      ippanmei: string;
      ippanmeicode: string;
      isEditing不均等レコード: boolean;
      isSelected: boolean;
    }
  ) {
    this.id = aux.id;
    this.薬品レコード = src.薬品レコード;
    this.単位変換レコード = src.単位変換レコード;
    this.不均等レコード = src.不均等レコード;
    this.負担区分レコード = src.負担区分レコード;
    this.薬品１回服用量レコード = src.薬品１回服用量レコード;
    this.薬品補足レコード = src.薬品補足レコード;
    this.ippanmei = aux.ippanmei;
    this.ippanmeicode = aux.ippanmeicode;
    this.isEditing不均等レコード = aux.isEditing不均等レコード;
    this.isSelected = aux.isSelected;
  }

  static fromObject(obj: 薬品情報): 薬品情報Edit {
    return new 薬品情報Edit(
      {
        薬品レコード: 薬品レコードEdit.fromObject(obj.薬品レコード),
        単位変換レコード: obj.単位変換レコード,
        不均等レコード: obj.不均等レコード
          ? 不均等レコードEdit.fromObject(obj.不均等レコード)
          : undefined,
        負担区分レコード: obj.負担区分レコード
          ? 負担区分レコードEdit.fromObject(obj.負担区分レコード)
          : undefined,
        薬品１回服用量レコード: obj.薬品１回服用量レコード
          ? 薬品１回服用量レコードEdit.fromObject(obj.薬品１回服用量レコード)
          : undefined,
        薬品補足レコード: obj.薬品補足レコード?.map((record) =>
          薬品補足レコードEdit.fromObject(record)
        ),
      },
      {
        id: nextId(),
        ippanmei: "",
        ippanmeicode: "",
        isEditing不均等レコード: false,
        isSelected: false,
      }
    );
  }

  clone(): 薬品情報Edit {
    return new 薬品情報Edit(
      {
        薬品レコード: this.薬品レコード.clone(),
        単位変換レコード: this.単位変換レコード,
        不均等レコード: this.不均等レコード?.clone(),
        負担区分レコード: this.負担区分レコード?.clone(),
        薬品１回服用量レコード: this.薬品１回服用量レコード?.clone(),
        薬品補足レコード: this.薬品補足レコード?.map((record) =>
          record.clone()
        ),
      },
      this
    );
  }

  isEditing(): boolean {
    return (
      this.薬品レコード.isEditing() ||
      this.isEditing不均等レコード ||
      !!(
        this.薬品補足レコード && this.薬品補足レコード.some((r) => r.isEditing)
      ) ||
      !!(this.負担区分レコード && this.負担区分レコード.isEditing())
    );
  }

  clearEditingFlags() {
    this.薬品レコード.clearEditingFlags();
    this.isEditing不均等レコード = false;
    this.薬品補足レコード?.forEach((r) => r.clearEditingFlags());
    this.負担区分レコード?.clearEditingFlags();
  }

  toObject(): 薬品情報 {
    let obj: 薬品情報 = {
      薬品レコード: this.薬品レコード.toObject(),
    };
    if (this.単位変換レコード !== undefined) {
      obj.単位変換レコード = this.単位変換レコード;
    }
    if (this.不均等レコード !== undefined) {
      obj.不均等レコード = this.不均等レコード.toObject();
    }
    if (this.負担区分レコード !== undefined) {
      const 負担区分 = this.負担区分レコード.toObject();
      if (負担区分 !== undefined) {
        obj.負担区分レコード = 負担区分;
      }
    }
    if (this.薬品１回服用量レコード !== undefined) {
      obj.薬品１回服用量レコード = this.薬品１回服用量レコード.toObject();
    }
    if (
      this.薬品補足レコード !== undefined &&
      this.薬品補足レコード.length > 0
    ) {
      obj.薬品補足レコード = this.薬品補足レコード.map((record) =>
        record.toObject()
      );
    }
    return obj;
  }

  addDrugSuppl(suppl: 薬品補足レコードEdit): void {
    if (this.薬品補足レコード === undefined) {
      this.薬品補足レコード = [];
    }
    this.薬品補足レコード.push(suppl);
  }

  薬品補足レコードAsList(): 薬品補足レコードEdit[] {
    return this.薬品補足レコード ?? [];
  }

  getKind(): "iyakuhin" | "kizai" | "ippanmei" | undefined {
    if (this.薬品レコード.薬品コード === "") {
      return undefined;
    }
    if (this.薬品レコード.情報区分 === "医薬品") {
      if (this.薬品レコード.薬品名称.startsWith("【般】")) {
        return "ippanmei";
      } else {
        return "iyakuhin";
      }
    } else if (this.薬品レコード.情報区分 === "医療材料") {
      return "kizai";
    } else {
      return undefined;
    }
  }

  isConvertibleToIppanmei(): boolean {
    return (
      this.ippanmeicode !== "" &&
      this.薬品レコード.薬品コード !== this.ippanmeicode
    );
  }

  convertToIppanmei(): void {
    if (this.ippanmeicode !== "") {
      this.薬品レコード.薬品名称 = this.ippanmei;
      this.薬品レコード.薬品コード = this.ippanmeicode;
      this.薬品レコード.薬品コード種別 = "一般名コード";
    }
  }
}

export class 剤形レコードEdit implements 剤形レコード {
  剤形区分: 剤形区分;
  剤形名称?: string;
  調剤数量: number;
  isEditing剤形区分: boolean;
  isEditing調剤数量: boolean;

  constructor(
    src: {
      剤形区分: 剤形区分;
      剤形名称?: string;
      調剤数量: number;
    },
    aux: {
      isEditing剤形区分: boolean;
      isEditing調剤数量: boolean;
    }
  ) {
    this.剤形区分 = src.剤形区分;
    this.剤形名称 = src.剤形名称;
    this.調剤数量 = src.調剤数量;
    this.isEditing剤形区分 = aux.isEditing剤形区分;
    this.isEditing調剤数量 = aux.isEditing調剤数量;
  }

  static fromObject(obj: 剤形レコード): 剤形レコードEdit {
    return new 剤形レコードEdit(obj, {
      isEditing剤形区分: false,
      isEditing調剤数量: false,
    });
  }

  clone(): 剤形レコードEdit {
    return new 剤形レコードEdit(this, this);
  }

  isEditing(): boolean {
    return this.isEditing剤形区分 || this.isEditing調剤数量;
  }

  clearEditingFlags() {
    this.isEditing剤形区分 = false;
    this.isEditing調剤数量 = false;
  }

  toObject(): 剤形レコード {
    let obj: 剤形レコード = {
      剤形区分: this.剤形区分,
      調剤数量: this.調剤数量,
    };
    if (this.剤形名称 !== undefined) {
      obj.剤形名称 = this.剤形名称;
    }
    return obj;
  }
}

export class 用法レコードEdit implements 用法レコード {
  用法コード: string;
  用法名称: string;
  用法１日回数?: number;
  isEditing用法コード: boolean;

  constructor(
    src: {
      用法コード: string;
      用法名称: string;
      用法１日回数?: number;
    },
    aux: {
      isEditing用法コード: boolean;
    }
  ) {
    this.用法コード = src.用法コード;
    this.用法名称 = src.用法名称;
    this.用法１日回数 = src.用法１日回数;
    this.isEditing用法コード = aux.isEditing用法コード;
  }

  static fromObject(obj: 用法レコード): 用法レコードEdit {
    return new 用法レコードEdit(obj, { isEditing用法コード: false });
  }

  clone(): 用法レコードEdit {
    return new 用法レコードEdit(this, this);
  }

  isEditing(): boolean {
    return this.isEditing用法コード;
  }

  clearEditingFlags() {
    this.isEditing用法コード = false;
  }

  toObject(): 用法レコード {
    let obj: 用法レコード = {
      用法コード: this.用法コード,
      用法名称: this.用法名称,
    };
    if (this.用法１日回数 !== undefined) {
      obj.用法１日回数 = this.用法１日回数;
    }
    return obj;
  }
}

export class 用法補足レコードEdit implements 用法補足レコード {
  id: number;
  isEditing用法補足情報: boolean;
  用法補足区分?: 用法補足区分;
  用法補足情報: string;

  constructor(
    src: {
      用法補足区分?: 用法補足区分;
      用法補足情報: string;
    },
    aux: { id: number; isEditing用法補足情報: boolean }
  ) {
    this.id = aux.id;
    this.isEditing用法補足情報 = aux.isEditing用法補足情報;
    this.用法補足区分 = src.用法補足区分;
    this.用法補足情報 = src.用法補足情報;
  }

  static fromObject(obj: 用法補足レコード): 用法補足レコードEdit {
    return new 用法補足レコードEdit(obj, {
      id: nextId(),
      isEditing用法補足情報: false,
    });
  }

  static fromInfo(用法補足情報: string): 用法補足レコードEdit {
    return 用法補足レコードEdit.fromObject({ 用法補足情報 });
  }

  clone(): 用法補足レコードEdit {
    return new 用法補足レコードEdit(this, this);
  }

  isEditing(): boolean {
    return this.isEditing用法補足情報;
  }

  clearEditingFlags() {
    this.isEditing用法補足情報 = false;
  }

  toObject(): 用法補足レコード {
    let obj: 用法補足レコード = {
      用法補足情報: this.用法補足情報,
    };
    if (this.用法補足区分 !== undefined) {
      obj.用法補足区分 = this.用法補足区分;
    }
    return obj;
  }
}

export class RP剤情報Edit implements RP剤情報 {
  id: number;
  剤形レコード: 剤形レコードEdit;
  用法レコード: 用法レコードEdit;
  用法補足レコード?: 用法補足レコードEdit[];
  薬品情報グループ: 薬品情報Edit[];
  isSelected: boolean;

  constructor(
    src: {
      剤形レコード: 剤形レコードEdit;
      用法レコード: 用法レコードEdit;
      用法補足レコード?: 用法補足レコードEdit[];
      薬品情報グループ: 薬品情報Edit[];
    },
    aux: { id: number; isSelected: boolean }
  ) {
    this.剤形レコード = src.剤形レコード;
    this.用法レコード = src.用法レコード;
    this.用法補足レコード = src.用法補足レコード;
    this.薬品情報グループ = src.薬品情報グループ;
    this.id = aux.id;
    this.isSelected = aux.isSelected;
  }

  static fromObject(obj: RP剤情報): RP剤情報Edit {
    return new RP剤情報Edit(
      {
        剤形レコード: 剤形レコードEdit.fromObject(obj.剤形レコード),
        用法レコード: 用法レコードEdit.fromObject(obj.用法レコード),
        用法補足レコード: obj.用法補足レコード?.map((record) =>
          用法補足レコードEdit.fromObject(record)
        ),
        薬品情報グループ: obj.薬品情報グループ.map((info) =>{
          return 薬品情報Edit.fromObject(info)
      }),
      },
      { id: nextId(), isSelected: false }
    );
  }

  clone(): RP剤情報Edit {
    return new RP剤情報Edit(
      {
        剤形レコード: this.剤形レコード.clone(),
        用法レコード: this.用法レコード.clone(),
        用法補足レコード: this.用法補足レコード?.map((record) =>
          record.clone()
        ),
        薬品情報グループ: this.薬品情報グループ.map((info) => info.clone()),
      },
      this
    );
  }

  isEditing(): boolean {
    return (
      this.剤形レコード.isEditing() ||
      this.用法レコード.isEditing() ||
      this.薬品情報グループ.some((d) => d.isEditing()) ||
      !!this.用法補足レコード?.some((r) => r.isEditing())
    );
  }

  clearEditingFlagsExceptDrugs() {
    this.剤形レコード.clearEditingFlags();
    this.用法レコード.clearEditingFlags();
    this.用法補足レコード?.forEach((r) => r.clearEditingFlags());
  }

  isModified(orig: RP剤情報): boolean {
    return !isEqualRP剤情報(this, orig);
  }

  toPrescOfPrefab(): RP剤情報 {
    let obj: RP剤情報 = {
      剤形レコード: this.剤形レコード.toObject(),
      用法レコード: this.用法レコード.toObject(),
      薬品情報グループ: this.薬品情報グループ.map((info) => info.toObject()),
    };
    if (
      this.用法補足レコード !== undefined &&
      this.用法補足レコード.length > 0
    ) {
      obj.用法補足レコード = this.用法補足レコード.map((record) =>
        record.toObject()
      );
    }
    return obj;
  }

  findDrugById(drugId: number): 薬品情報Edit | undefined {
    for (let drug of this.薬品情報グループ) {
      if (drug.id === drugId) {
        return drug;
      }
    }
    return undefined;
  }

  includesDrug(drugId: number): boolean {
    return this.findDrugById(drugId) !== undefined;
  }

  getDrugById(drugId: number): 薬品情報Edit {
    const d = this.findDrugById(drugId);
    if (d === undefined) {
      throw new Error("cannot find drug");
    }
    return d;
  }

  addUsageSuppl(suppl: 用法補足レコードEdit): void {
    if (this.用法補足レコード === undefined) {
      this.用法補足レコード = [];
    }
    this.用法補足レコード.push(suppl);
  }

  用法補足レコードAsList(): 用法補足レコードEdit[] {
    return this.用法補足レコード ?? [];
  }
}

export class 公費レコードEdit implements 公費レコード {
  公費負担者番号: string;
  公費受給者番号?: string;

  constructor(src: { 公費負担者番号: string; 公費受給者番号?: string }) {
    this.公費負担者番号 = src.公費負担者番号;
    this.公費受給者番号 = src.公費受給者番号;
  }

  static fromObject(obj: 公費レコード): 公費レコードEdit {
    return new 公費レコードEdit(obj);
  }

  clone(): 公費レコードEdit {
    return new 公費レコードEdit(this);
  }

  toObject(): 公費レコード {
    let obj: 公費レコード = {
      公費負担者番号: this.公費負担者番号,
    };
    if (this.公費受給者番号 !== undefined) {
      obj.公費受給者番号 = this.公費受給者番号;
    }
    return obj;
  }
}

export class 麻薬施用レコードEdit implements 麻薬施用レコード {
  麻薬施用者免許番号: string;
  麻薬施用患者住所: string;
  麻薬施用患者電話番号: string;

  constructor(src: {
    麻薬施用者免許番号: string;
    麻薬施用患者住所: string;
    麻薬施用患者電話番号: string;
  }) {
    this.麻薬施用者免許番号 = src.麻薬施用者免許番号;
    this.麻薬施用患者住所 = src.麻薬施用患者住所;
    this.麻薬施用患者電話番号 = src.麻薬施用患者電話番号;
  }

  static fromObject(obj: 麻薬施用レコード): 麻薬施用レコードEdit {
    return new 麻薬施用レコードEdit(obj);
  }

  clone(): 麻薬施用レコードEdit {
    return new 麻薬施用レコードEdit(this);
  }

  toObject(): 麻薬施用レコード {
    return {
      麻薬施用者免許番号: this.麻薬施用者免許番号,
      麻薬施用患者住所: this.麻薬施用患者住所,
      麻薬施用患者電話番号: this.麻薬施用患者電話番号,
    };
  }
}

export class 備考レコードEdit implements 備考レコード {
  id: number;
  isEditing: boolean;
  備考: string;

  constructor(
    src: {
      備考: string;
    },
    aux: { id: number; isEditing: boolean }
  ) {
    this.備考 = src.備考;
    this.id = aux.id;
    this.isEditing = aux.isEditing;
  }

  static fromObject(obj: 備考レコード): 備考レコードEdit {
    return new 備考レコードEdit(obj, { id: nextId(), isEditing: false });
  }

  static fromBikou(備考: string): 備考レコードEdit {
    return 備考レコードEdit.fromObject({ 備考 });
  }

  clone(): 備考レコードEdit {
    return new 備考レコードEdit(this, this);
  }

  toObject(): 備考レコード {
    return {
      備考: this.備考,
    };
  }
}

export class 提供診療情報レコードEdit implements 提供診療情報レコード {
  id: number;
  isEditing: boolean;
  薬品名称?: string;
  コメント: string;

  constructor(
    src: {
      薬品名称?: string;
      コメント: string;
    },
    aux: { id: number; isEditing: boolean }
  ) {
    this.薬品名称 = src.薬品名称;
    this.コメント = src.コメント;
    this.id = aux.id;
    this.isEditing = aux.isEditing;
  }

  static fromObject(obj: 提供診療情報レコード): 提供診療情報レコードEdit {
    return new 提供診療情報レコードEdit(obj, {
      id: nextId(),
      isEditing: false,
    });
  }

  static fromComment(comment: string): 提供診療情報レコードEdit {
    return 提供診療情報レコードEdit.fromObject({ コメント: comment });
  }

  clone(): 提供診療情報レコードEdit {
    return new 提供診療情報レコードEdit(this, this);
  }

  toObject(): 提供診療情報レコード {
    let obj: 提供診療情報レコード = {
      コメント: this.コメント,
    };
    if (this.薬品名称 !== undefined) {
      obj.薬品名称 = this.薬品名称;
    }
    return obj;
  }
}

export class 検査値データ等レコードEdit implements 検査値データ等レコード {
  id: number;
  isEditing: boolean;
  検査値データ等: string;

  constructor(
    src: {
      検査値データ等: string;
    },
    aux: { id: number; isEditing: boolean }
  ) {
    this.id = aux.id;
    this.検査値データ等 = src.検査値データ等;
    this.isEditing = aux.isEditing;
  }

  static fromObject(obj: 検査値データ等レコード): 検査値データ等レコードEdit {
    return new 検査値データ等レコードEdit(obj, {
      id: nextId(),
      isEditing: false,
    });
  }

  static fromData(data: string): 検査値データ等レコードEdit {
    return 検査値データ等レコードEdit.fromObject({ 検査値データ等: data });
  }

  clone(): 検査値データ等レコードEdit {
    return new 検査値データ等レコードEdit(this, this);
  }

  toObject(): 検査値データ等レコード {
    return {
      検査値データ等: this.検査値データ等,
    };
  }
}

export class 提供情報レコードEdit implements 提供情報レコード {
  提供診療情報レコード?: 提供診療情報レコードEdit[];
  検査値データ等レコード?: 検査値データ等レコードEdit[];

  constructor(src: {
    提供診療情報レコード?: 提供診療情報レコードEdit[];
    検査値データ等レコード?: 検査値データ等レコードEdit[];
  }) {
    this.提供診療情報レコード = src.提供診療情報レコード;
    this.検査値データ等レコード = src.検査値データ等レコード;
  }

  static fromObject(obj: 提供情報レコード): 提供情報レコードEdit {
    return new 提供情報レコードEdit({
      提供診療情報レコード: obj.提供診療情報レコード?.map((record) =>
        提供診療情報レコードEdit.fromObject(record)
      ),
      検査値データ等レコード: obj.検査値データ等レコード?.map((record) =>
        検査値データ等レコードEdit.fromObject(record)
      ),
    });
  }

  clone(): 提供情報レコードEdit {
    return new 提供情報レコードEdit({
      提供診療情報レコード: this.提供診療情報レコード?.map((record) =>
        record.clone()
      ),
      検査値データ等レコード: this.検査値データ等レコード?.map((record) =>
        record.clone()
      ),
    });
  }

  toObject(): 提供情報レコード | undefined {
    if (
      (this.提供診療情報レコード === undefined ||
        this.提供診療情報レコード.length === 0) &&
      (this.検査値データ等レコード === undefined ||
        this.検査値データ等レコード.length === 0)
    ) {
      return undefined;
    }
    let obj: 提供情報レコード = {};
    if (
      this.提供診療情報レコード !== undefined &&
      this.提供診療情報レコード.length > 0
    ) {
      obj.提供診療情報レコード = this.提供診療情報レコード.map((record) =>
        record.toObject()
      );
    }
    if (
      this.検査値データ等レコード !== undefined &&
      this.検査値データ等レコード.length > 0
    ) {
      obj.検査値データ等レコード = this.検査値データ等レコード.map((record) =>
        record.toObject()
      );
    }
    return obj;
  }
}

export class PrescInfoDataEdit implements PrescInfoData {
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
  };
  医師コード?: string;
  医師カナ氏名?: string;
  医師漢字氏名: string;
  患者コード?: string;
  患者漢字氏名: string;
  患者カナ氏名: string;
  患者性別: 性別コード;
  患者生年月日: string;
  保険一部負担金区分?: 保険一部負担金区分コード;
  保険種別?: 保険種別コード;
  保険者番号: string;
  被保険者証記号?: string;
  被保険者証番号: string;
  被保険者被扶養者: 被保険者等種別;
  被保険者証枝番?: string;
  負担割合?: number;
  職務上の事由?: 職務上の事由コード;
  第一公費レコード?: 公費レコードEdit;
  第二公費レコード?: 公費レコードEdit;
  第三公費レコード?: 公費レコードEdit;
  特殊公費レコード?: 公費レコードEdit;
  レセプト種別コード?: string;
  処方箋交付年月日: string;
  使用期限年月日?: string;
  麻薬施用レコード?: 麻薬施用レコードEdit;
  残薬確認対応フラグ?: 残薬確認対応フラグ;
  備考レコード?: 備考レコードEdit[];
  引換番号?: string;
  RP剤情報グループ: RP剤情報Edit[];
  提供情報レコード?: 提供情報レコードEdit;

  constructor(src: {
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
    };
    医師コード?: string;
    医師カナ氏名?: string;
    医師漢字氏名: string;
    患者コード?: string;
    患者漢字氏名: string;
    患者カナ氏名: string;
    患者性別: 性別コード;
    患者生年月日: string;
    保険一部負担金区分?: 保険一部負担金区分コード;
    保険種別?: 保険種別コード;
    保険者番号: string;
    被保険者証記号?: string;
    被保険者証番号: string;
    被保険者被扶養者: 被保険者等種別;
    被保険者証枝番?: string;
    負担割合?: number;
    職務上の事由?: 職務上の事由コード;
    第一公費レコード?: 公費レコードEdit;
    第二公費レコード?: 公費レコードEdit;
    第三公費レコード?: 公費レコードEdit;
    特殊公費レコード?: 公費レコードEdit;
    レセプト種別コード?: string;
    処方箋交付年月日: string;
    使用期限年月日?: string;
    麻薬施用レコード?: 麻薬施用レコードEdit;
    残薬確認対応フラグ?: 残薬確認対応フラグ;
    備考レコード?: 備考レコードEdit[];
    引換番号?: string;
    RP剤情報グループ: RP剤情報Edit[];
    提供情報レコード?: 提供情報レコードEdit;
  }) {
    this.医療機関コード種別 = src.医療機関コード種別;
    this.医療機関コード = src.医療機関コード;
    this.医療機関都道府県コード = src.医療機関都道府県コード;
    this.医療機関名称 = src.医療機関名称;
    this.医療機関郵便番号 = src.医療機関郵便番号;
    this.医療機関所在地 = src.医療機関所在地;
    this.医療機関電話番号 = src.医療機関電話番号;
    this.ＦＡＸ番号 = src.ＦＡＸ番号;
    this.その他連絡先 = src.その他連絡先;
    this.診療科レコード = src.診療科レコード;
    this.医師コード = src.医師コード;
    this.医師カナ氏名 = src.医師カナ氏名;
    this.医師漢字氏名 = src.医師漢字氏名;
    this.患者コード = src.患者コード;
    this.患者漢字氏名 = src.患者漢字氏名;
    this.患者カナ氏名 = src.患者カナ氏名;
    this.患者性別 = src.患者性別;
    this.患者生年月日 = src.患者生年月日;
    this.保険一部負担金区分 = src.保険一部負担金区分;
    this.保険種別 = src.保険種別;
    this.保険者番号 = src.保険者番号;
    this.被保険者証記号 = src.被保険者証記号;
    this.被保険者証番号 = src.被保険者証番号;
    this.被保険者被扶養者 = src.被保険者被扶養者;
    this.被保険者証枝番 = src.被保険者証枝番;
    this.負担割合 = src.負担割合;
    this.職務上の事由 = src.職務上の事由;
    this.第一公費レコード = src.第一公費レコード;
    this.第二公費レコード = src.第二公費レコード;
    this.第三公費レコード = src.第三公費レコード;
    this.特殊公費レコード = src.特殊公費レコード;
    this.レセプト種別コード = src.レセプト種別コード;
    this.処方箋交付年月日 = src.処方箋交付年月日;
    this.使用期限年月日 = src.使用期限年月日;
    this.麻薬施用レコード = src.麻薬施用レコード;
    this.残薬確認対応フラグ = src.残薬確認対応フラグ;
    this.備考レコード = src.備考レコード;
    this.引換番号 = src.引換番号;
    this.RP剤情報グループ = src.RP剤情報グループ;
    this.提供情報レコード = src.提供情報レコード;
  }

  static fromObject(obj: PrescInfoData): PrescInfoDataEdit {
    return new PrescInfoDataEdit({
      医療機関コード種別: obj.医療機関コード種別,
      医療機関コード: obj.医療機関コード,
      医療機関都道府県コード: obj.医療機関都道府県コード,
      医療機関名称: obj.医療機関名称,
      医療機関郵便番号: obj.医療機関郵便番号,
      医療機関所在地: obj.医療機関所在地,
      医療機関電話番号: obj.医療機関電話番号,
      ＦＡＸ番号: obj.ＦＡＸ番号,
      その他連絡先: obj.その他連絡先,
      診療科レコード: obj.診療科レコード,
      医師コード: obj.医師コード,
      医師カナ氏名: obj.医師カナ氏名,
      医師漢字氏名: obj.医師漢字氏名,
      患者コード: obj.患者コード,
      患者漢字氏名: obj.患者漢字氏名,
      患者カナ氏名: obj.患者カナ氏名,
      患者性別: obj.患者性別,
      患者生年月日: obj.患者生年月日,
      保険一部負担金区分: obj.保険一部負担金区分,
      保険種別: obj.保険種別,
      保険者番号: obj.保険者番号,
      被保険者証記号: obj.被保険者証記号,
      被保険者証番号: obj.被保険者証番号,
      被保険者被扶養者: obj.被保険者被扶養者,
      被保険者証枝番: obj.被保険者証枝番,
      負担割合: obj.負担割合,
      職務上の事由: obj.職務上の事由,
      第一公費レコード: obj.第一公費レコード
        ? 公費レコードEdit.fromObject(obj.第一公費レコード)
        : undefined,
      第二公費レコード: obj.第二公費レコード
        ? 公費レコードEdit.fromObject(obj.第二公費レコード)
        : undefined,
      第三公費レコード: obj.第三公費レコード
        ? 公費レコードEdit.fromObject(obj.第三公費レコード)
        : undefined,
      特殊公費レコード: obj.特殊公費レコード
        ? 公費レコードEdit.fromObject(obj.特殊公費レコード)
        : undefined,
      レセプト種別コード: obj.レセプト種別コード,
      処方箋交付年月日: obj.処方箋交付年月日,
      使用期限年月日: obj.使用期限年月日,
      麻薬施用レコード: obj.麻薬施用レコード
        ? 麻薬施用レコードEdit.fromObject(obj.麻薬施用レコード)
        : undefined,
      残薬確認対応フラグ: obj.残薬確認対応フラグ,
      備考レコード: obj.備考レコード?.map((record) =>
        備考レコードEdit.fromObject(record)
      ),
      引換番号: obj.引換番号,
      RP剤情報グループ: obj.RP剤情報グループ.map((info) =>
        RP剤情報Edit.fromObject(info)
      ),
      提供情報レコード: obj.提供情報レコード
        ? 提供情報レコードEdit.fromObject(obj.提供情報レコード)
        : undefined,
    });
  }

  clone(): PrescInfoDataEdit {
    return new PrescInfoDataEdit({
      医療機関コード種別: this.医療機関コード種別,
      医療機関コード: this.医療機関コード,
      医療機関都道府県コード: this.医療機関都道府県コード,
      医療機関名称: this.医療機関名称,
      医療機関郵便番号: this.医療機関郵便番号,
      医療機関所在地: this.医療機関所在地,
      医療機関電話番号: this.医療機関電話番号,
      ＦＡＸ番号: this.ＦＡＸ番号,
      その他連絡先: this.その他連絡先,
      診療科レコード: this.診療科レコード,
      医師コード: this.医師コード,
      医師カナ氏名: this.医師カナ氏名,
      医師漢字氏名: this.医師漢字氏名,
      患者コード: this.患者コード,
      患者漢字氏名: this.患者漢字氏名,
      患者カナ氏名: this.患者カナ氏名,
      患者性別: this.患者性別,
      患者生年月日: this.患者生年月日,
      保険一部負担金区分: this.保険一部負担金区分,
      保険種別: this.保険種別,
      保険者番号: this.保険者番号,
      被保険者証記号: this.被保険者証記号,
      被保険者証番号: this.被保険者証番号,
      被保険者被扶養者: this.被保険者被扶養者,
      被保険者証枝番: this.被保険者証枝番,
      負担割合: this.負担割合,
      職務上の事由: this.職務上の事由,
      第一公費レコード: this.第一公費レコード?.clone(),
      第二公費レコード: this.第二公費レコード?.clone(),
      第三公費レコード: this.第三公費レコード?.clone(),
      特殊公費レコード: this.特殊公費レコード?.clone(),
      レセプト種別コード: this.レセプト種別コード,
      処方箋交付年月日: this.処方箋交付年月日,
      使用期限年月日: this.使用期限年月日,
      麻薬施用レコード: this.麻薬施用レコード?.clone(),
      残薬確認対応フラグ: this.残薬確認対応フラグ,
      備考レコード: this.備考レコード?.map((record) => record.clone()),
      引換番号: this.引換番号,
      RP剤情報グループ: this.RP剤情報グループ.map((info) => info.clone()),
      提供情報レコード: this.提供情報レコード?.clone(),
    });
  }

  toObject(): PrescInfoData {
    let obj: PrescInfoData = {
      医療機関コード種別: this.医療機関コード種別,
      医療機関コード: this.医療機関コード,
      医療機関都道府県コード: this.医療機関都道府県コード,
      医療機関名称: this.医療機関名称,
      医療機関所在地: this.医療機関所在地,
      医療機関電話番号: this.医療機関電話番号,
      医師漢字氏名: this.医師漢字氏名,
      患者漢字氏名: this.患者漢字氏名,
      患者カナ氏名: this.患者カナ氏名,
      患者性別: this.患者性別,
      患者生年月日: this.患者生年月日,
      保険者番号: this.保険者番号,
      被保険者証番号: this.被保険者証番号,
      被保険者被扶養者: this.被保険者被扶養者,
      処方箋交付年月日: this.処方箋交付年月日,
      RP剤情報グループ: this.RP剤情報グループ.map((info) => info.toPrescOfPrefab()),
    };

    // Optional fields
    if (this.医療機関郵便番号 !== undefined) {
      obj.医療機関郵便番号 = this.医療機関郵便番号;
    }
    if (this.ＦＡＸ番号 !== undefined) {
      obj.ＦＡＸ番号 = this.ＦＡＸ番号;
    }
    if (this.その他連絡先 !== undefined) {
      obj.その他連絡先 = this.その他連絡先;
    }
    if (this.診療科レコード !== undefined) {
      obj.診療科レコード = this.診療科レコード;
    }
    if (this.医師コード !== undefined) {
      obj.医師コード = this.医師コード;
    }
    if (this.医師カナ氏名 !== undefined) {
      obj.医師カナ氏名 = this.医師カナ氏名;
    }
    if (this.患者コード !== undefined) {
      obj.患者コード = this.患者コード;
    }
    if (this.保険一部負担金区分 !== undefined) {
      obj.保険一部負担金区分 = this.保険一部負担金区分;
    }
    if (this.保険種別 !== undefined) {
      obj.保険種別 = this.保険種別;
    }
    if (this.被保険者証記号 !== undefined) {
      obj.被保険者証記号 = this.被保険者証記号;
    }
    if (this.被保険者証枝番 !== undefined) {
      obj.被保険者証枝番 = this.被保険者証枝番;
    }
    if (this.負担割合 !== undefined) {
      obj.負担割合 = this.負担割合;
    }
    if (this.職務上の事由 !== undefined) {
      obj.職務上の事由 = this.職務上の事由;
    }
    if (this.第一公費レコード !== undefined) {
      obj.第一公費レコード = this.第一公費レコード.toObject();
    }
    if (this.第二公費レコード !== undefined) {
      obj.第二公費レコード = this.第二公費レコード.toObject();
    }
    if (this.第三公費レコード !== undefined) {
      obj.第三公費レコード = this.第三公費レコード.toObject();
    }
    if (this.特殊公費レコード !== undefined) {
      obj.特殊公費レコード = this.特殊公費レコード.toObject();
    }
    if (this.レセプト種別コード !== undefined) {
      obj.レセプト種別コード = this.レセプト種別コード;
    }
    if (this.使用期限年月日 !== undefined) {
      obj.使用期限年月日 = this.使用期限年月日;
    }
    if (this.麻薬施用レコード !== undefined) {
      obj.麻薬施用レコード = this.麻薬施用レコード.toObject();
    }
    if (this.残薬確認対応フラグ !== undefined) {
      obj.残薬確認対応フラグ = this.残薬確認対応フラグ;
    }
    if (this.備考レコード !== undefined && this.備考レコード.length > 0) {
      obj.備考レコード = this.備考レコード.map((record) => record.toObject());
    }
    if (this.引換番号 !== undefined) {
      obj.引換番号 = this.引換番号;
    }
    if (this.提供情報レコード !== undefined) {
      const 提供情報 = this.提供情報レコード.toObject();
      if (提供情報 !== undefined) {
        obj.提供情報レコード = 提供情報;
      }
    }

    return obj;
  }

  add提供診療情報レコード(record: 提供診療情報レコードEdit) {
    if (this.提供情報レコード === undefined) {
      this.提供情報レコード = 提供情報レコードEdit.fromObject({});
    }
    if (this.提供情報レコード.提供診療情報レコード === undefined) {
      this.提供情報レコード.提供診療情報レコード = [];
    }
    this.提供情報レコード.提供診療情報レコード.push(record);
  }

  add検査値データ等レコード(record: 検査値データ等レコードEdit) {
    if (this.提供情報レコード === undefined) {
      this.提供情報レコード = 提供情報レコードEdit.fromObject({});
    }
    if (this.提供情報レコード.検査値データ等レコード === undefined) {
      this.提供情報レコード.検査値データ等レコード = [];
    }
    this.提供情報レコード.検査値データ等レコード.push(record);
  }

  set提供診療情報レコード(
    records: 提供診療情報レコードEdit[] | undefined
  ): void {
    if (!this.提供情報レコード) {
      this.提供情報レコード = 提供情報レコードEdit.fromObject({});
    }
    this.提供情報レコード.提供診療情報レコード = records;
    this.normalize提供情報レコード();
  }

  set検査値データ等レコード(
    records: 検査値データ等レコードEdit[] | undefined
  ): void {
    if (!this.提供情報レコード) {
      this.提供情報レコード = 提供情報レコードEdit.fromObject({});
    }
    this.提供情報レコード.検査値データ等レコード = records;
    this.normalize提供情報レコード();
  }

  normalize提供情報レコード(): void {
    if (this.提供情報レコード) {
      if (this.提供情報レコード.提供診療情報レコード) {
        if (this.提供情報レコード.提供診療情報レコード.length === 0) {
          delete this.提供情報レコード.提供診療情報レコード;
        }
      }
      if (this.提供情報レコード.検査値データ等レコード) {
        if (this.提供情報レコード.検査値データ等レコード.length === 0) {
          delete this.提供情報レコード.検査値データ等レコード;
        }
      }
      if (
        !this.提供情報レコード.提供診療情報レコード &&
        !this.提供情報レコード.検査値データ等レコード
      ) {
        delete this.提供情報レコード;
      }
    }
  }

  selectDrugExclusive(groupId: number, drugId: number) {
    this.RP剤情報グループ.forEach((g) => {
      if (g.id === groupId) {
        g.isSelected = true;
        g.薬品情報グループ.forEach((d) => {
          d.isSelected = d.id === drugId;
        });
      } else {
        g.isSelected = false;
        g.薬品情報グループ.forEach((d) => (d.isSelected = false));
      }
    });
  }

  clearAllSelected() {
    this.RP剤情報グループ.forEach((g) => {
      g.isSelected = false;
      g.薬品情報グループ.forEach((d) => {
        d.isSelected = false;
      });
    });
  }

  hasKouhi(): boolean {
    return !!(
      this.第一公費レコード ||
      this.第二公費レコード ||
      this.第三公費レコード ||
      this.特殊公費レコード
    );
  }

  findRP剤情報ById(groupId: number): RP剤情報Edit | undefined {
    for (let group of this.RP剤情報グループ) {
      if (group.id === groupId) {
        return group;
      }
    }
    return undefined;
  }

  hasRP剤情報(groupId: number): boolean {
    return this.findRP剤情報ById(groupId) !== undefined;
  }
}
