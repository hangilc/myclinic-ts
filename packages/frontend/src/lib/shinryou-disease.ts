import { v4 as uuidv4 } from "uuid";

export function createId(): string {
  return uuidv4();
}

export type ShinryouDisease = {
  id: string;
  shinryouName: string;
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
      let reqs = shinryouDisease.requirements;
      reqs = reqs.filter(req => !isRequirementSatisified(req, diseases));
      let fixOpts = reqs.map(req => createFixFromRequirement(req, ctx));
      for(let f of fixOpts){
        if( !f ){
          return undefined;
        }
      }
      let fixes: Fix[] = fixOpts.filter(fix => fix != undefined);
      let label = fixes.map(fix => fix.label).join("：");
      return {
        label,
        exec: async() => {
          await Promise.all(fixes.map(fix => fix.exec()))
        }
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
  if( !arg.hasOwnProperty("id") ){
    arg.id = createId();
  } else {
    let id = arg.id;
    if( typeof id !== "string" ){
      throw new Error("id is not string");
    }
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
    validateRequirement(arg);
  } else if(kind === "multi-disease-check") {
    if( !arg.hasOwnProperty("requirements") ){
      throw new Error("missing requirements property");
    }
    let reqs = arg.requirements;
    for(let req of reqs){
      validateRequirement(req);
    }
  } else if(kind === "no-check") {
    // nop
  } else {
    throw new Error(`invalid kind: ${kind}`);
  }
  return arg;
}

function validateRequirement(arg: any): Requirement {
  if( typeof arg !== "object" ){
    throw new Error("is not object");
  }
  if( !arg.hasOwnProperty("diseaseName") ){
    throw new Error("missing diseaseName property");
  }
  let diseaseName = arg.diseaseName;
  if( typeof diseaseName !== "string" ){
    throw new Error("diseaseName property is not string");
  }
  if( arg.hasOwnProperty("fix") ){
    let fix = arg.fix;
    if( typeof fix !== "object" ){
      throw new Error("is not object (fix)");
    }
    if( !fix.hasOwnProperty("diseaseName")){
      throw new Error("missing diseaseName propert (fix)");
    }
    let diseaseName = fix.diseaseName;
    if( typeof diseaseName !== "string" ){
      throw new Error("diseaseName is not string (fix)");
    }
    if( !fix.hasOwnProperty("adjNames")){
      throw new Error("missing adjNames propert (fix)");
    }
    let adjNames = fix.adjNames;
    if( !Array.isArray(adjNames) ){
      throw new Error("adjNames is not Array");
    }
    for(let adj of adjNames){
      if( typeof adj !== "string" ){
        throw new Error("adjNames element is not string");
      }
    }
  }
  return arg;
}


