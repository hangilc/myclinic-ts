import type {
  剤形区分,
  力価フラグ,
  情報区分,
  用法補足区分,
} from "@/lib/denshi-shohou/denshi-shohou";
import type {
  PrescInfoData,
  RP剤情報,
  不均等レコード,
  備考レコード,
  剤形レコード,
  提供情報レコード,
  提供診療情報レコード,
  検査値データ等レコード,
  用法レコード,
  用法補足レコード,
  薬品レコード,
  薬品情報,
  薬品補足レコード,
} from "@/lib/denshi-shohou/presc-info";
import type { 薬品コード種別 } from "@/lib/denshi-shohou/denshi-shohou";
import type { Drug, DrugGroup, Shohou } from "@/lib/parse-shohou";
import { DateWrapper } from "myclinic-util";
import { initPrescInfoDataFromVisitId } from "../denshi-shohou/visit-shohou";
import { toHankaku } from "@/lib/zenkaku";
import { listDateItems } from "../date-picker/date-item";

export async function shohouToPrescInfo(
  shohou: Shohou,
  visitId: number
): Promise<PrescInfoData> {
  let data: PrescInfoData = await initPrescInfoDataFromVisitId(visitId);
  data.使用期限年月日 = get使用期限年月日FromShohou(shohou);
  data.備考レコード = get備考レコードFromShohou(shohou);
  data.提供情報レコード = get提供情報レコードFromShohou(shohou);
  data.RP剤情報グループ = shohou.groups.map((g) => getRP剤情報FromGroup(g));
  return data;
}

export function get使用期限年月日FromShohou(
  shohou: Shohou
): string | undefined {
  let kigen = shohou.kigen;
  if (kigen) {
    return DateWrapper.from(kigen).asOnshiDate();
  } else {
    return undefined;
  }
}

export function get備考レコードFromShohou(shohou: Shohou): 備考レコード[] {
  let bikou: 備考レコード[] = [];
  for (let b of shohou.bikou) {
    if (b === "高７" || b === "高８" || b === "高９") {
      continue;
    }
    bikou.push({ 備考: b });
  }
  if (shohou.comments) {
    for (let c of shohou.comments) {
      if (c === "一包化") {
        bikou.push({ 備考: "一包化" });
      }
    }
  }
  return bikou;
}

export function get提供診療情報レコードFromShohou(
  shohou: Shohou
): 提供診療情報レコード[] {
  let 提供診療情報レコード: 提供診療情報レコード[] = [];
  if (shohou.comments) {
    for (let c of shohou.comments) {
      if (c === "一包化") {
        continue;
      } else {
        提供診療情報レコード.push({ コメント: c });
      }
    }
  }
  return 提供診療情報レコード;
}

export function get検査値データ等レコードFromShohou(
  _shohou: Shohou
): 検査値データ等レコード[] {
  return [];
}

function get提供情報レコードFromShohou(
  shohou: Shohou
): 提供情報レコード | undefined {
  let a: 提供診療情報レコード[] = get提供診療情報レコードFromShohou(shohou);
  let b: 検査値データ等レコード[] = get検査値データ等レコードFromShohou(shohou);
  if (a.length === 0 && b.length === 0) {
    return undefined;
  } else {
    return {
      提供診療情報レコード: a,
      検査値データ等レコード: b,
    };
  }
}

function getRP剤情報FromGroup(group: DrugGroup): RP剤情報 {
  let 剤形レコード: 剤形レコード = get剤形レコードFromGroup(group);
  return {
    剤形レコード,
    用法レコード: get用法レコードFromGroup(group),
    用法補足レコード: get用法補足レコードFromGroup(group),
    薬品情報グループ: group.drugs.map((d) =>
      get薬品情報FromDrug(d, 剤形レコード.剤形区分)
    ),
  };
}

function get剤形レコードFromGroup(group: DrugGroup): 剤形レコード {
  return {
    剤形区分: get剤形区分FromGroup(group),
    調剤数量: get調剤数量FromGroup(group),
  };
}

function get剤形区分FromGroup(group: DrugGroup): 剤形区分 {
  // Most frequent case
  if (group.usage.kind === "days") {
    return "内服";
  }

  // Check usage pattern first
  if (group.usage.kind === "times") {
    // Times-based usage typically indicates 頓服 (as needed)
    return "頓服";
  }

  // Check drug names and units for external use indicators
  for (const drug of group.drugs) {
    const name = drug.name.toLowerCase();
    const unit = drug.unit.toLowerCase();

    // External use (外用) indicators
    if (
      name.includes("軟膏") ||
      name.includes("クリーム") ||
      name.includes("ローション") ||
      name.includes("湿布") ||
      name.includes("シール") ||
      name.includes("貼付") ||
      name.includes("点眼") ||
      name.includes("点鼻") ||
      name.includes("吸入") ||
      name.includes("うがい") ||
      name.includes("外用") ||
      name.includes("塗布") ||
      unit.includes("g") ||
      (unit.includes("ml") && (name.includes("点眼") || name.includes("点鼻")))
    ) {
      return "外用";
    }

    // Injectable (注射) indicators
    if (
      name.includes("注射") ||
      name.includes("注入") ||
      name.includes("静注") ||
      name.includes("筋注") ||
      name.includes("皮下注") ||
      unit.includes("バイアル") ||
      unit.includes("アンプル")
    ) {
      return "注射";
    }

    // Liquid internal use (内服滴剤) indicators
    if (
      (name.includes("内服液") ||
        name.includes("シロップ") ||
        name.includes("滴剤")) &&
      unit.includes("ml")
    ) {
      return "内服滴剤";
    }
  }

  // Fallback to unknown
  return "不明";
}

function get調剤数量FromGroup(group: DrugGroup): number {
  const usage = group.usage;

  // For days-based prescriptions, return the number of days
  if (usage.kind === "days") {
    const days = parseInt(toHankaku(usage.days));
    if (isNaN(days)) {
      throw new Error(`Invalid days value: ${usage.days}`);
    }
    return days;
  }

  // For times-based prescriptions (頓服), return the number of times
  if (usage.kind === "times") {
    const times = parseInt(toHankaku(usage.times));
    if (isNaN(times)) {
      throw new Error(`Invalid times value: ${usage.times}`);
    }
    return times;
  }

  return 1;
}

function get用法レコードFromGroup(group: DrugGroup): 用法レコード {
  return {
    用法コード: "",
    用法名称: group.usage.usage,
  };
}

function get用法補足レコードFromGroup(group: DrugGroup): 用法補足レコード[] {
  let 用法補足レコード: 用法補足レコード[] = [];
  for (let c of group.groupComments) {
    用法補足レコード.push({
      用法補足情報: c,
    });
  }
  return 用法補足レコード;
}

function get薬品情報FromDrug(drug: Drug, 剤形区分: 剤形区分): 薬品情報 {
  return {
    薬品レコード: get薬品レコードfromDrug(drug, 剤形区分),
    不均等レコード: get不均等レコードFromDrug(drug),
    薬品補足レコード: get薬品補足レコードFromDrug(drug),
  };
}

function get不均等レコードFromDrug(drug: Drug): 不均等レコード | undefined {
  if (drug.uneven) {
    let uneven = drug.uneven;
    uneven = uneven.replace(/^\s*[(（]/, "");
    uneven = uneven.replace(/[)）]\s*$/, "");
    let sep = /\s*[-ー－]\s*/;
    const unevenParts = uneven.split(sep);
    if (unevenParts.length >= 2) {
      const 不均等レコード: 不均等レコード = {
        不均等１回目服用量: toHankaku(unevenParts[0]),
        不均等２回目服用量: toHankaku(unevenParts[1]),
        不均等３回目服用量: unevenParts[2]
          ? toHankaku(unevenParts[2].trim())
          : undefined,
        不均等４回目服用量: unevenParts[3]
          ? toHankaku(unevenParts[3].trim())
          : undefined,
        不均等５回目服用量: unevenParts[4]
          ? toHankaku(unevenParts[4].trim())
          : undefined,
      };
      return 不均等レコード;
    } else throw new Error("uneven record has less than two parts.");
  } else {
    undefined;
  }
}

function get薬品補足レコードFromDrug(
  drug: Drug
): 薬品補足レコード[] | undefined {
  let 薬品補足レコード: 薬品補足レコード[] = [];
  if (drug.senpatsu) {
    let 薬品補足情報: string;
    switch (drug.senpatsu) {
      case "henkoufuka":
        薬品補足情報 = "後発品変更不可";
        break;
      case "kanjakibou":
        薬品補足情報 = "先発医薬品患者希望";
        break;
      default:
        throw new Error(`Unknown senpatsu type: ${drug.senpatsu}`);
    }
    薬品補足レコード.push({ 薬品補足情報 });
  }
  if (drug.drugComments) {
    for (const comment of drug.drugComments) {
      薬品補足レコード.push({ 薬品補足情報: comment });
    }
  }
  return 薬品補足レコード.length === 0 ? undefined : 薬品補足レコード;
}

function get薬品レコードfromDrug(drug: Drug, 剤形区分: 剤形区分): 薬品レコード {
  const 情報区分: 情報区分 = 剤形区分 === "医療材料" ? "医療材料" : "医薬品";
  const 薬品コード種別: 薬品コード種別 = drug.name.startsWith("【般】")
    ? "一般名コード"
    : "レセプト電算処理システム用コード";
  return {
    情報区分,
    薬品コード種別,
    薬品コード: "",
    薬品名称: drug.name,
    分量: drug.amount,
    力価フラグ: "薬価単位",
    単位名: drug.unit,
  };
}

// Wrapper /////////////////////////////////////////////////////////////////////////////////////
let serialId = 1;

class Wrapper<T> {
  id: number;
  data: T;

  constructor(data: T, id?: number) {
    if (!id) {
      id = serialId++;
    }
    this.id = id;
    this.data = Object.assign({}, data);
  }

  toDenshi(): T {
    return this.data;
  }

  assign(src: Wrapper<T>): void {
    this.data = src.data;
  }
}

function unwrap<T>(list: Wrapper<T>[]): T[] {
  return list.map((r) => r.toDenshi());
}

export class PrescInfoWrapper extends Wrapper<PrescInfoData> {
  備考レコード: 備考レコードWrapper[];
  提供情報レコード: 提供情報レコードWrapper;
  RP剤情報グループ: RP剤情報Wrapper[];

  constructor(data: PrescInfoData, id?: number) {
    super(data, id);
    this.備考レコード = (data.備考レコード ?? []).map(
      (r) => new 備考レコードWrapper(r)
    );
    this.提供情報レコード = new 提供情報レコードWrapper(
      data.提供情報レコード ?? {}
    );
    this.RP剤情報グループ = data.RP剤情報グループ.map(
      (g) => new RP剤情報Wrapper(g)
    );
  }

  toDenshi(): PrescInfoData {
    return Object.assign({}, super.toDenshi(), {
      備考レコード: unwrap(this.備考レコード),
      提供情報レコード: this.提供情報レコード.toDenshi(),
      RP剤情報グループ: unwrap(this.RP剤情報グループ),
    });
  }

  clone(): PrescInfoWrapper {
    return new PrescInfoWrapper(this.toDenshi(), this.id);
  }

  assign(src: PrescInfoWrapper) {
    super.assign(src);
    Object.assign(this, {
      備考レコード: src.備考レコード,
      提供情報レコード: src.提供情報レコード,
      RP剤情報グループ: src.RP剤情報グループ,
    });
  }
}

export class 備考レコードWrapper extends Wrapper<備考レコード> {
  clone(): 備考レコードWrapper {
    return new 備考レコードWrapper(this.toDenshi(), this.id);
  }
}

export class 提供診療情報レコードWrapper extends Wrapper<提供診療情報レコード> {
  clone(): 提供診療情報レコードWrapper {
    return new 提供診療情報レコードWrapper(this.toDenshi(), this.id);
  }
}

export class 検査値データ等レコードWrapper extends Wrapper<検査値データ等レコード> {
  clone(): 検査値データ等レコードWrapper {
    return new 検査値データ等レコードWrapper(this.toDenshi(), this.id);
  }
}

export class 用法補足レコードWrapper extends Wrapper<用法補足レコード> {
  isEditing: boolean = false;

  clone(): 用法補足レコードWrapper {
    let r = new 用法補足レコードWrapper(this.toDenshi(), this.id);
    r.isEditing = this.isEditing;
    return r;
  }

  assign(src: 用法補足レコードWrapper) {
    super.assign(src);
    this.isEditing = src.isEditing;
  }
}

export class 薬品補足レコードWrapper extends Wrapper<薬品補足レコード> {
  isEditing: boolean = false;

  clone(): 薬品補足レコードWrapper {
    return Object.assign(new 薬品補足レコードWrapper(this.toDenshi(), this.id), { isEditing: this.isEditing });
  }

  toDenshi(): 薬品補足レコード {
    if( this.isEditing ){
      throw new Error(`薬品補足レコードが編集中ｎです。`);
    }
    return super.toDenshi();
  }

  assign(src: 薬品補足レコードWrapper) {
    super.assign(src);
    this.isEditing = src.isEditing;
  }
}

export class 提供情報レコードWrapper extends Wrapper<提供情報レコード> {
  提供診療情報レコード: 提供診療情報レコードWrapper[];
  検査値データ等レコード: 検査値データ等レコードWrapper[];

  constructor(data: 提供情報レコード, id?: number) {
    super(data, id);
    this.提供診療情報レコード = (data.提供診療情報レコード ?? []).map(
      (r) => new 提供診療情報レコードWrapper(r)
    );
    this.検査値データ等レコード = (data.検査値データ等レコード ?? []).map(
      (r) => new 検査値データ等レコードWrapper(r)
    );
  }

  toDenshi(): 提供情報レコード {
    return Object.assign({}, super.toDenshi(), {
      提供診療情報レコード: unwrap(this.提供診療情報レコード),
      検査値データ等レコード: unwrap(this.検査値データ等レコード),
    });
  }

  clone(): 提供情報レコードWrapper {
    return new 提供情報レコードWrapper(this.toDenshi(), this.id);
  }

  assign(src: 提供情報レコードWrapper): void {
    super.assign(src);
    Object.assign(this, {
      提供診療情報レコード: src.提供診療情報レコード,
      検査値データ等レコード: src.検査値データ等レコード,
    })
  }
}

export class RP剤情報Wrapper extends Wrapper<RP剤情報> {
  用法補足レコード: 用法補足レコードWrapper[];
  薬品情報グループ: 薬品情報Wrapper[];

  constructor(data: RP剤情報, id?: number) {
    super(data, id);
    this.用法補足レコード = (data.用法補足レコード ?? []).map(
      (r) => new 用法補足レコードWrapper(r)
    );
    this.薬品情報グループ = data.薬品情報グループ.map(
      (r) => new 薬品情報Wrapper(r)
    );
  }

  toDenshi(): RP剤情報 {
    return Object.assign({}, super.toDenshi(), {
      用法補足レコード: unwrap(this.用法補足レコード),
      薬品情報グループ: unwrap(this.薬品情報グループ),
    });
  }

  clone(): RP剤情報Wrapper {
    return new RP剤情報Wrapper(this.toDenshi(), this.id);
  }

  assign(src: RP剤情報Wrapper) {
    super.assign(src);
    Object.assign(this, {
      用法補足レコード: src.用法補足レコード,
      薬品情報グループ: src.薬品情報グループ,
    })
  }
}

export class 薬品情報Wrapper extends Wrapper<薬品情報> {
  薬品補足レコード: 薬品補足レコードWrapper[];
  ippanmei?: string;
  ippanmeicode?: string;

  constructor(data: 薬品情報, id?: number) {
    super(data, id);
    this.薬品補足レコード = (data.薬品補足レコード ?? []).map(
      (r) => new 薬品補足レコードWrapper(r)
    );
  }

  toDenshi(): 薬品情報 {
    return Object.assign({}, super.toDenshi(), {
      薬品補足レコード: unwrap(this.薬品補足レコード),
    });
  }

  clone(): 薬品情報Wrapper {
    return new 薬品情報Wrapper(this.toDenshi(), this.id);
  }

  assign(src: 薬品情報Wrapper) {
    super.assign(src);
    Object.assign(this, {
      薬品補足レコード: src.薬品補足レコード,
    })
  }
}
