export interface StepEntry {
  description: string;
  steps: ({ count: number, ten: number }[])
}

const G = ["01", "02", "03", "05", "06", "07", "08", "09", "10", "11"] as const;
export type HoukatsuGroup = typeof G[number];

export function isHoukatsuGroup(g: string): g is HoukatsuGroup {
  for(let e of G){
    if( e === g ){
      return true;
    }
  }
  return false;
}

export interface HoukatsuStep {
  validFrom: string;
  groups: Record<HoukatsuGroup, StepEntry>;
}

export function getHoukatsuStep(sqldate: string): HoukatsuStep {
  for (let s of HoukatsuArchive) {
    if (sqldate >= s.validFrom) {
      return s;
    }
  }
  throw new Error("Cannot find houkatsu for " + sqldate);
}

export function houkatsuTenOf(group: HoukatsuGroup, count: number, houkatsu: HoukatsuStep): number | undefined {
  const steps = houkatsu.groups[group].steps;
  for(let step of steps){
    if( count >= step.count ){
      return step.ten;
    }
  }
  return undefined;
}

export const HoukatsuArchive: HoukatsuStep[] = [
  {
    validFrom: "2022-04-01",
    groups: {
      "01": {
        description: "血液化学",
        steps: [
          { count: 10, ten: 106 },
          { count: 8, ten: 99 },
          { count: 5, ten: 93 }
        ]
      },
      "02": {
        description: "内分泌",
        steps: [
          { count: 8, ten: 900 },
          { count: 6, ten: 623 },
          { count: 3, ten: 410 }
        ]
      },
      "03": {
        description: "肝炎",
        steps: [
          { count: 5, ten: 425 },
          { count: 4, ten: 360 },
          { count: 3, ten: 290 }
        ]
      },
      "05": {
        description: "腫瘍マーカー",
        steps: [
          { count: 4, ten: 396 },
          { count: 3, ten: 290 },
          { count: 2, ten: 230 }
        ]
      },
      "06": {
        description: "出血・凝固",
        steps: [
          { count: 5, ten: 722 },
          { count: 3, ten: 530 }
        ]
      },
      "07": {
        description: "自己抗体",
        steps: [
          { count: 3, ten: 490 },
          { count: 2, ten: 320 }
        ]
      },
      "08": {
        description: "内分泌負荷試験",
        steps: [
          { count: 3, ten: 3600 }
        ]
      },
      "09": {
        description: "感染症抗体価",
        steps: [
          { count: 8, ten: 632 }
        ]
      },
      "10": {
        description: "グロブリンクラス別抗体価",
        steps: [
          { count: 2, ten: 412 }
        ]
      },
      "11": {
        description: "IgE",
        steps: [
          { count: 13, ten: 1430 }
        ]
      }
    }
  }
]
