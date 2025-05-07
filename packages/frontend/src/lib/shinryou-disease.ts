export type ShinryouDisease = {
  shinryouName: string
} & (DiseaseCheck | MultiDiseaseCheck |  NoCheck);

interface DiseaseCheck {
  kind: "disease-check";
  diseaseName: string;
  fix?: { diseaseName: string, adjNames: string[] }
}

interface MultiDiseaseCheck {
  kind: "multi-disease-check";
  diseaseNames: string[];
  fix?: { diseaseName: string, adjNames: string[] }[];
}

interface NoCheck {
  kind: "no-check";
}

export interface Fix {
  label: string;
  exec: () => Promise<void>;
}

interface Context {
  enterDisease: (diseaseName: string, adjNames: string[]) => Promise<void>;
}

export function hasMatchingShinryouDiseases(
  shinryouName: string,
  diseaseNames: string[],
  shinryouDiseases: ShinryouDisease[],
  ctx: Context
): true | Fix[] {
  const fixes: Fix[] = [];
  for (let sd of shinryouDiseases) {
    if (shinryouName.indexOf(sd.shinryouName) >= 0) {
      const r = execCheck(sd, diseaseNames, ctx);
      if (r === true) {
        return true;
      } else if (r === false) {
        // nop
      } else {
        fixes.push(r);
      }
    }
  }
  return fixes;
}

export function createFix(shinryouDisease: ShinryouDisease, ctx: Context): Fix | undefined {
  switch (shinryouDisease.kind) {
    case "disease-check": {
      if (shinryouDisease.fix) {
        const dname = shinryouDisease.fix.diseaseName;
        const anames = shinryouDisease.fix.adjNames;
        let label = dname;
        if (anames.length > 0) {
          label = `${label}（${anames.join("・")}）`;
        }
        return {
          label: `「${label}」を追加`,
          exec: () => ctx.enterDisease(dname, anames),
        }
      } else {
        return undefined;
      }
    }
    case "multi-disease-check": {
      if( shinryouDisease.fix ){
        
      } else {
        return undefined;
      }
    }
    default: {
      return undefined;
    }
  }
}

function execCheck(shinryouDisease: ShinryouDisease, diseases: string[], ctx: Context): boolean | Fix {
  switch (shinryouDisease.kind) {
    case "disease-check": {
      if (diseaseNamesContain(diseases, shinryouDisease.diseaseName)) {
        return true;
      } else {
        const fix = createFix(shinryouDisease, ctx);
        return fix ?? false;
      }
    }
    case "multi-disease-check":{
      if( diseaseNamesContainAll(diseases, shinryouDisease.diseaseNames)) {
        return true;
      } else {
        const fix = createFix(shinryouDisease, ctx);
        return fix ?? false;
      }
    }
    case "no-check": {
      return true;
    }
  }
}

function diseaseNamesContain(names: string[], shortName: string): boolean {
  for (let name of names) {
    if (name.indexOf(shortName) >= 0) {
      return true;
    }
  }
  return false;
}

function diseaseNamesContainAll(names: string[], shortNames: string[]): boolean {
  for(let shortName of shortNames){
    if( !diseaseNamesContain(names, shortName) ){
      return false;
    }
  }
  return true;
}
