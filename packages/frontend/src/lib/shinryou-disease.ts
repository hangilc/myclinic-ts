export type ShinryouDisease = {
  shinryouName: string
} & (DiseaseCheck | MultiDiseaseCheck |  NoCheck);


export type DiseaseCheck = {
  kind: "disease-check" 
} & Requirement

interface MultiDiseaseCheck {
  kind: "multi-disease-check";
  requirements: Requirement[];
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

export interface Requirement {
  diseaseName: string;
  fix?: { diseaseName: string, adjNames: string []}
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

function createFixFromRequirement(req: Requirement, ctx: Context): Fix | undefined {
  if( req.fix ){
    const dname = req.fix.diseaseName;
    const anames = req.fix.adjNames;
    let label = fixItemLabel(req.fix);
    return {
      label: `「${label}」を追加`,
      exec: () => ctx.enterDisease(dname, anames),
    }
  } else {
    return undefined;
  }
}

export function createFix(shinryouDisease: ShinryouDisease, ctx: Context, diseases: string[]): Fix | undefined {
  switch (shinryouDisease.kind) {
    case "disease-check": {
      return createFixFromRequirement(shinryouDisease, ctx);
    }
    case "multi-disease-check": {
      let fixOpts = shinryouDisease.requirements.map(req => createFixFromRequirement(req, ctx));
      let fixes: Fix[] = fixOpts.filter(fix => fix != undefined);
      let label = fixes.map(fix => fix.label).join("：");
      let execAll = Promise.all(fixes.map(fix => fix.exec))
      return {
        label,
        exec: async () => { await execAll }
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
      if (isRequirementSatisified(shinryouDisease, diseases)){
        return true;
      } else {
        const fix = createFix(shinryouDisease, ctx, diseases);
        return fix ?? false;
      }
    }
    case "multi-disease-check":{
      if( isAllRequirementsSatisfied(shinryouDisease.requirements, diseases) ){
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

function isRequirementSatisified(req: Requirement, diseaseNames: string[]): boolean {
  for(let name of diseaseNames){
    if( name.indexOf(req.diseaseName) >= 0 ){
      return true;
    }
  }
  return false;
}

function isAllRequirementsSatisfied(reqs: Requirement[], diseaseNames: string[]): boolean {
  for(let req of reqs){
    if( !isRequirementSatisified(req, diseaseNames) ){
      return false;
    }
  }
  return true;
}

export function validateShinryouDisease(arg: any): ShinryouDisease {
  if( typeof arg !== "object" ){
    throw new Error("not an object");
  }
  if( !arg.hasOwnProperty("shinryouName") ){
    throw new Error("missing shinryouName property");
  }
  let shinryouName = arg.shinryouName;
  if( typeof shinryouName !== "string" ){
    throw new Error("shinryouName is not string");
  }
  if( !arg.hasOwnProperty("kind") ){
    throw new Error("missing kind property");
  }
  let kind = arg.kind;
  if( typeof kind !== "string" ){
    throw new Error("kind is not string");
  }
  if( kind === "disease-check" ){
    
  } else {
    throw new Error(`invalid kind: ${kind}`);
  }
  return arg;
}


