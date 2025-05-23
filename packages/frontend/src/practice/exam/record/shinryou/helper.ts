import {
  ConductKindType, ConductShinryou, CreateConductRequest, CreateShinryouConductRequest, Shinryou, VisitEx
} from "myclinic-model"
import api from "@/lib/api"
import { dateParam } from "@/lib/date-param"
import type { RegularNamesSet } from "./regular-names";

async function resolveShinryoucode(src: string | number, at: string): Promise<number> {
  if (typeof src === "number") {
    const result: number | null = await api.resolveShinryoucode(src, at);
    if (result == null) {
      throw new Error("診療行為が有効でありません：" + src);
    } else {
      return result;
    }
  } else {
    const code = await api.resolveShinryoucodeByName(src, at);
    if (code == null) {
      throw new Error("診療行為をみつけられません：" + src);
    } else {
      return code;
    }
  }
}

async function resolveKizaicode(src: string | number, at: string): Promise<number> {
  if (typeof src === "number") {
    return src;
  } else {
    const code = await api.resolveKizaicodeByName(src, at);
    if (code == null) {
      throw new Error("器材をみつけられません：" + src);
    } else {
      return code;
    }
  }
}

async function batchResolveShinryoucodes(
  srcList: (string | number)[],
  at: string
): Promise<{ shinryoucode: number }[]> {
  return await Promise.all(
    srcList.map(async s => {
      const code = await resolveShinryoucode(s, at);
      return { shinryoucode: code };
    })
  );
}

async function batchResolveKizaicodes(
  srcList: { code: string | number, amount: number }[],
  at: string
): Promise<{ kizaicode: number, amount: number }[]> {
  return await Promise.all(
    srcList.map(async src => {
      const code = await resolveKizaicode(src.code, at);
      return { kizaicode: code, amount: src.amount };
    })
  )
}

async function batchResolveIyakuhincodes(
  srcList: { iyakuhincode: number, amount: number }[],
  _at: string
): Promise<{ iyakuhincode: number, amount: number }[]> {
  return await Promise.all(
    srcList.map(async src => {
      const code = src.iyakuhincode;
      return { iyakuhincode: code, amount: src.amount };
    })
  )
}

async function conductReq(
  at: string,
  visitId: number,
  kind: ConductKindType,
  labelOption: string | undefined,
  shinryou: (string | number)[],
  drug: { iyakuhincode: number, amount: number }[],
  kizai: ({ code: string | number, amount: number })[]
): Promise<CreateConductRequest> {
  const s = await batchResolveShinryoucodes(shinryou, at);
  const d = await batchResolveIyakuhincodes(drug, at);
  const k = await batchResolveKizaicodes(kizai, at);
  return new CreateConductRequest({
    visitId: visitId,
    kind: kind.code,
    labelOption: labelOption,
    shinryouList: s.map(({ shinryoucode }) => {
      return new ConductShinryou(
        0, 0, shinryoucode
      )
    }),
    // shinryouList: s.map(obj => Object.assign(obj, { conductShinryouId: 0, conductId: 0 })),
    drugs: d.map(obj => Object.assign(obj, { conductDrugId: 0, conductId: 0 })),
    kizaiList: k.map(obj => Object.assign(obj, { conductKizaiId: 0, conductId: 0 }))
  });
}

export type ConductSpec = {
  kind: ConductKindType,
  labelOption: string | undefined,
  shinryou: (number | string)[],
  drug: {
    iyakuhincode: number,
    amount: number
  }[],
  kizai: {
    code: string | number,
    amount: number
  }[]
}

export async function enter(
  visit: VisitEx,
  shinryou: (string | number)[],
  conduct: ConductSpec[]
) {
  await enterTo(visit.visitId, visit.visitedAt.substring(0, 10), shinryou, conduct);
}

export async function enterTo(
  visitId: number,
  atArg: (string | Date),
  shinryou: (string | number)[],
  conduct: ConductSpec[]) {
  const at: string = dateParam(atArg);
  const shinryouList = (await batchResolveShinryoucodes(shinryou, at))
    .map(tmpl => Object.assign(tmpl, { shinryouId: 0, visitId }))
    .map(arg => Shinryou.cast(arg));
  const conducts = (await Promise.all(conduct.map(async src =>
    conductReq(at, visitId, src.kind, src.labelOption, src.shinryou, src.drug, src.kizai))))
    .map(obj => Object.assign(obj, { conductId: 0 }))
  const req: CreateShinryouConductRequest = {
    shinryouList,
    conducts
  };
  await api.batchEnterShinryouConduct(req);
}

export function adaptRegularNamesToDxKasan(set: RegularNamesSet, dxLevel: number | undefined):
  RegularNamesSet {
  if (dxLevel === 1) {
    const left = set.left.filter(e => {
      if (typeof e === "string") {
        return true;
      } else {
        switch (e.label) {
          case "医療ＤＸ推進２（初診）":
          case "医療ＤＸ推進３（初診）": return false;
          default: return true;
        }
      }
    });
    return Object.assign({}, { right: set.right, bottom: set.bottom }, { left });
  } else if (dxLevel === 2) {
    const left = set.left.filter(e => {
      if (typeof e === "string") {
        return true;
      } else {
        switch (e.label) {
          case "医療ＤＸ推進１（初診）":
          case "医療ＤＸ推進３（初診）": return false;
          default: return true;
        }
      }
    });
    return Object.assign({}, { right: set.right, bottom: set.bottom }, { left });
  } else if (dxLevel === 3) {
    const left = set.left.filter(e => {
      if (typeof e === "string") {
        return true;
      } else {
        switch (e.label) {
          case "医療ＤＸ推進１（初診）":
          case "医療ＤＸ推進２（初診）": return false;
          default: return true;
        }
      }
    });
    return Object.assign({}, { right: set.right, bottom: set.bottom }, { left });
  } else {
    return set;
  }
}












