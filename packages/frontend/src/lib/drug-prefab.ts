import { v4 as uuidv4 } from "uuid";

import {
  RP剤情報Edit,
  剤形レコードEdit,
  用法レコードEdit,
  用法補足レコードEdit,
  薬品情報Edit,
} from "./denshi-editor/denshi-edit";
import type {
  RP剤情報,
  剤形レコード,
  用法レコード,
  用法補足レコード,
  薬品情報,
} from "./denshi-shohou/presc-info";
import { createEmptyRP剤情報 } from "./denshi-shohou/presc-info-helper";
import { createEmpty薬品情報 } from "./denshi-helper";

export interface DrugPrefab {
  id: string;
  presc: PrescOfPrefab;
  alias: string[];
  tag: string[];
  comment: string;
}

export function emptyDrugPrefab(): DrugPrefab {
  const group = createEmptyRP剤情報();
  const drug = createEmpty薬品情報();
  group.薬品情報グループ.push(drug);
  const presc = convertRP剤情報ToPrescOfPrefab(group);
  return createDrugPrefab(presc);
}

export function createDrugPrefab(presc: PrescOfPrefab): DrugPrefab {
  return {
    id: uuidv4(),
    presc,
    alias: [],
    tag: [],
    comment: "",
  };
}

let nextAliasId = 1;

export class AliasEdit {
  id: number;
  value: string;
  isEditing: boolean = false;

  constructor(value: string, id?: number) {
    if( id == undefined ){
      id = nextAliasId++;
    }
    this.id = id;
    this.value = value;
  }
}

export class DrugPrefabEdit {
  id: string;
  presc: PrescOfPrefabEdit;
  alias: AliasEdit[];
  tag: string[];
  comment: string;

  constructor(arg: {
    id: string;
    presc: PrescOfPrefabEdit;
    alias: string[];
    tag: string[];
    comment: string;
  }) {
    this.id = arg.id;
    this.presc = arg.presc;
    this.alias = arg.alias.map(a => new AliasEdit(a));
    this.tag = arg.tag;
    this.comment = arg.comment;
  }

  static fromDrugPrefab(pre: DrugPrefab): DrugPrefabEdit {
    return new DrugPrefabEdit({
      id: pre.id,
      presc: PrescOfPrefabEdit.fromPrescOfPrefab(pre.presc),
      alias: pre.alias,
      tag: pre.tag,
      comment: pre.comment,
    });
  }

  toDrugPrefab(): DrugPrefab {
    return {
      id: this.id,
      presc: this.presc.toPrescOfPrefab(),
      alias: this.alias.map(a => a.value),
      tag: this.tag,
      comment: this.comment,
    }
  }

  assignToDrugPrefab(dst: DrugPrefab) {
    dst.id = this.id;
    dst.presc = this.presc.toPrescOfPrefab();
    dst.alias = this.alias.map(a => a.value);
    dst.tag = this.tag;
    dst.comment = this.comment;
  }
}

export interface PrescOfPrefab {
  剤形レコード: 剤形レコード;
  用法レコード: 用法レコード;
  用法補足レコード?: 用法補足レコード[];
  薬品情報グループ: [薬品情報];
}

export function convertRP剤情報ToPrescOfPrefab(group: RP剤情報): PrescOfPrefab {
  if (group.薬品情報グループ.length !== 1) {
    throw new Error(
      "cannot convert to PrescOfPrefab (number of drugs is not one)"
    );
  }
  let drug: 薬品情報 = group.薬品情報グループ[0];
  if( drug.負担区分レコード ){
    drug = Object.assign({}, drug);
    delete drug.負担区分レコード;
  }
  return {
    剤形レコード: group.剤形レコード,
    用法レコード: group.用法レコード,
    用法補足レコード: group.用法補足レコード,
    薬品情報グループ: [drug],
  };
}

export class PrescOfPrefabEdit extends RP剤情報Edit {
  override 薬品情報グループ: [薬品情報Edit];

  constructor(
    src: {
      剤形レコード: 剤形レコードEdit;
      用法レコード: 用法レコードEdit;
      用法補足レコード?: 用法補足レコードEdit[];
      薬品情報グループ: [薬品情報Edit];
    },
    aux: { id: number; isSelected: boolean }
  ) {
    super(
      {
        剤形レコード: src.剤形レコード,
        用法レコード: src.用法レコード,
        用法補足レコード: src.用法補足レコード,
        薬品情報グループ: src.薬品情報グループ,
      },
      aux
    );
    this.薬品情報グループ = src.薬品情報グループ;
  }

  static fromPrescOfPrefab(src: PrescOfPrefab): PrescOfPrefabEdit {
    return new PrescOfPrefabEdit(
      {
        剤形レコード: 剤形レコードEdit.fromObject(src.剤形レコード),
        用法レコード: 用法レコードEdit.fromObject(src.用法レコード),
        用法補足レコード: src.用法補足レコード?.map((record) =>
          用法補足レコードEdit.fromObject(record)
        ),
        薬品情報グループ: [薬品情報Edit.fromObject(src.薬品情報グループ[0])],
      },
      { id: 0, isSelected: false }
    );
  }

  toPrescOfPrefab(): PrescOfPrefab {
    const obj = super.toObject();
    return convertRP剤情報ToPrescOfPrefab(obj);
  }
}

export async function exapleDrugPrefab(): Promise<DrugPrefab[]> {
  return [
    {
      id: "example-id-1",
      presc: {
        剤形レコード: {
          剤形区分: "内服",
          調剤数量: 5,
        },
        用法レコード: {
          用法コード: "1013044400000000",
          用法名称: "１日３回朝昼夕食後　服用",
        },
        薬品情報グループ: [
          {
            薬品レコード: {
              分量: "3",
              力価フラグ: "薬価単位",
              単位名: "錠",
              情報区分: "医薬品",
              薬品コード: "620000033",
              薬品コード種別: "レセプト電算処理システム用コード",
              薬品名称: "カロナール錠３００　３００ｍｇ",
            },
          },
        ],
      },
      alias: [],
      tag: [],
      comment: "",
    },
  ];
}

export function searchDrugPrefab(
  fab: DrugPrefab[],
  name: string
): DrugPrefab[] {
  const result: DrugPrefab[] = [];
  for (let entry of fab) {
    if (entry.presc.薬品情報グループ[0].薬品レコード.薬品名称.includes(name)) {
      result.push(entry);
    } else {
      for (let a of entry.alias) {
        if (a.includes(name)) {
          result.push(entry);
          break;
        }
      }
    }
  }
  return result;
}
