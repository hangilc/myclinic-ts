import api from "@/lib/api";
import { cache } from "@/lib/cache";
import type {
  PrescInfoData,
  RP剤情報,
  薬品情報,
} from "@/lib/denshi-shohou/presc-info";
import type { DrugPrefab } from "@/lib/drug-prefab";
import type { IyakuhinMaster } from "myclinic-model";
import { DateWrapper } from "myclinic-util";

export async function shohowConv(data: PrescInfoData) {
  const at: string = DateWrapper.fromOnshiDate(
    data.処方箋交付年月日
  ).asSqlDate();
  const drugNameMap: Record<string, string> = await cache.getDrugNameConv();
  const prefabList = await cache.getDrugPrefabList();
  for (let group of data.RP剤情報グループ) {
    for (let drug of group.薬品情報グループ) {
      const name = drug.薬品レコード.薬品名称;
      const names: string[] = [name];
      const convName = drugNameMap[name];
      if( convName ){
        names.push(convName);
      }
      const m: IyakuhinMaster | undefined = await resolveIyakuhinMaster(names, at, prefabList);
      if( !m ){
        continue;
      }
    }
  }
  applyDrugNameConv(await cache.getDrugNameConv(), data);
  applyDrugUsageConv(await cache.getDrugUsageConv(), data);
  applyPrescExample(await cache.getDrugPrefabList(), data);
}

async function resolveIyakuhinMaster(
  names: string[],
  at: string,
  prefabList: DrugPrefab[]
): Promise<IyakuhinMaster | undefined> {
  for (let name of names) {
    const m = findIyakuhinMaster(name, at);
    if (m) {
      return m;
    }
  }
  for (let prefab of prefabList) {
    for (let a of prefab.alias) {
      if( names.includes(a) ){
        const prefabName =
          prefab.presc.薬品情報グループ[0].薬品レコード.薬品名称;
        let m = await findIyakuhinMaster(prefabName, at);
        if (m) {
          return m;
        }
      }
    }
  }
  return undefined;
}

async function findIyakuhinMaster(
  name: string,
  at: string
): Promise<IyakuhinMaster | undefined> {
  return (await api.findIyakuhinMasterByName(name, at)) || undefined;
}

function applyDrugNameConv(
  convMap: Record<string, string>,
  data: PrescInfoData
) {
  for (let group of data.RP剤情報グループ) {
    for (let drug of group.薬品情報グループ) {
      if (drug.薬品レコード.薬品コード !== "") {
        continue;
      }
      const bind = convMap[drug.薬品レコード.薬品名称];
      if (bind) {
        drug.薬品レコード.薬品名称 = bind;
      }
    }
  }
}

function applyDrugUsageConv(
  convMap: Record<string, string>,
  data: PrescInfoData
) {
  for (let group of data.RP剤情報グループ) {
    if (group.用法レコード.用法コード !== "") {
      continue;
    }
    const bind = convMap[group.用法レコード.用法名称];
    if (bind) {
      group.用法レコード.用法名称 = bind;
    }
  }
}

export async function applyPrescExample(
  list: DrugPrefab[],
  data: PrescInfoData
) {
  for (let group of data.RP剤情報グループ) {
    for (let drug of group.薬品情報グループ) {
      applyDrug(list, drug);
    }
    applyGroup(list, group);
  }
}

function applyGroup(list: DrugPrefab[], group: RP剤情報) {
  if (group.用法レコード.用法コード === "") {
    let code = findUsageCodeByName(list, group.用法レコード.用法名称);
    if (code !== undefined) {
      group.用法レコード.用法コード = code;
      return;
    }
  }
}

function findUsageCodeByName(
  list: DrugPrefab[],
  name: string
): string | undefined {
  for (let pre of list) {
    if (pre.presc.用法レコード.用法名称 === name) {
      return pre.presc.用法レコード.用法コード;
    }
  }
  return undefined;
}

function applyDrug(list: DrugPrefab[], drug: 薬品情報) {
  if (drug.薬品レコード.薬品コード === "") {
    let code = findIyakuhincodeByName(list, drug.薬品レコード.薬品名称);
    if (code !== undefined) {
      drug.薬品レコード.薬品コード = code;
      return;
    }
  }
}

function findIyakuhincodeByName(
  list: DrugPrefab[],
  name: string
): string | undefined {
  for (let pre of list) {
    if (pre.presc.薬品情報グループ[0].薬品レコード.薬品名称 === name) {
      return pre.presc.薬品情報グループ[0].薬品レコード.薬品コード;
    }
    for (let a of pre.alias) {
      if (a === name) {
        return pre.presc.薬品情報グループ[0].薬品レコード.薬品コード;
      }
    }
  }
  return undefined;
}
