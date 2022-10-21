import type {
  ConductKindType, CreateConductRequest, CreateShinryouConductRequest, VisitEx
} from "@/lib/model"
import api from "@/lib/api"
import { dateParam } from "@/lib/date-param"

async function resolveShinryoucode(src: string | number, at: string): Promise<number> {
  if (typeof src === "number") {
    return src;
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

async function conductReq(
  at: string,
  visitId: number,
  kind: ConductKindType,
  labelOption: string | undefined,
  shinryou: (string | number)[],
  kizai: ({ code: string | number, amount: number })[]
): Promise<CreateConductRequest> {
  const s = await batchResolveShinryoucodes(shinryou, at);
  const k = await batchResolveKizaicodes(kizai, at);
  return {
    visitId: visitId,
    kind: kind.code,
    labelOption,
    shinryouList: s.map(obj => Object.assign(obj, { conductShinryouId: 0, conductId: 0 })),
    drugs: [],
    kizaiList: k.map(obj => Object.assign(obj, { conductKizaiId: 0, conductId: 0 }))
  }
}

export type ShinryouSpec = number | string;

export type ConductSpec = {
  kind: ConductKindType,
  labelOption: string | undefined,
  shinryou: (string | number)[],
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
    .map(tmpl => Object.assign(tmpl, { shinryouId: 0, visitId }));
  const conducts = (await Promise.all(conduct.map(async src =>
    conductReq(at, visitId, src.kind, src.labelOption, src.shinryou, src.kizai))))
    .map(obj => Object.assign(obj, { conductId: 0 }))
  const req: CreateShinryouConductRequest = {
    shinryouList,
    conducts
  };
  await api.batchEnterShinryouConduct(req);
}
