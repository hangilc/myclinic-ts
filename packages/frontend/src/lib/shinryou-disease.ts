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

export function createFix(shinryouDisease: ShinryouDisease, ctx: Context, diseases: string[]): Fix | undefined {
  switch (shinryouDisease.kind) {
    case "disease-check": {
      if (shinryouDisease.fix) {
        const dname = shinryouDisease.fix.diseaseName;
        const anames = shinryouDisease.fix.adjNames;
        let label = fixItemLabel(shinryouDisease.fix);
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
        let fixItems: { diseaseName: string, adjNames: string[] }[] = [];
        for(let f of shinryouDisease.fix ){
          if( diseases.indexOf(f.diseaseName) >= 0){
            continue;
          }
          fixItems.push(f);
        }
        if( fixItems.length === 0 ){
          return undefined;
        }
        let label = fixItems.map(f => fixItemLabel(f)).join("、");
        return {
          label: `「${label}」を追加`,
          exec: async () => {
            await Promise.all(fixItems.map(f => ctx.enterDisease(f.diseaseName, f.adjNames)));
          },
        }
      } else {
        return undefined;
      }
    }
    default: {
      return undefined;
    }
  }
}

function fixItemLabel(f: { diseaseName: string, adjNames: string[] }): string {
  if( f.adjNames.length > 0 ) {
    return `${f.diseaseName}（${f.adjNames.join("・")}）`;
  } else {
    return f.diseaseName;
  }
}

function execCheck(shinryouDisease: ShinryouDisease, diseases: string[], ctx: Context): boolean | Fix {
  switch (shinryouDisease.kind) {
    case "disease-check": {
      if (diseaseNamesContain(diseases, shinryouDisease.diseaseName)) {
        return true;
      } else {
        const fix = createFix(shinryouDisease, ctx, diseases);
        return fix ?? false;
      }
    }
    case "multi-disease-check":{
      if( diseaseNamesContainAll(diseases, shinryouDisease.diseaseNames)) {
        return true;
      } else {
        const fix = createFix(shinryouDisease, ctx, diseases);
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
