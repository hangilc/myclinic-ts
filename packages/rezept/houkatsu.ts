import { HoukatsuArchive } from "./seikyuu-data/houkatsu-archive";

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

