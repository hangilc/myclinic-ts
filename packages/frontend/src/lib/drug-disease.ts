export interface DrugDisease {
  drugName: string;
  diseaseName: string;
  fix?: {
    pre: string[];
    name: string;
    post: string[];
  }
}

export function hasMatchingDrugDisease(
  drugName: string, diseaseNames: string[], drugDiseases: DrugDisease[]
): true | { pre: string[], name: string, post: string[] }[] {
  const fixes: { pre: string[], name: string, post: string[] }[] = [];
  for (let item of drugDiseases) {
    if (drugName.includes(item.drugName)) {
      for (let diseaseName of diseaseNames) {
        if (item.diseaseName.includes(diseaseName)) {
          return true;
        }
      }
      if( item.fix ){
        fixes.push(item.fix);
      }
    }
  }
  return fixes;
}

export function fullNameOfFix(fix: { pre: string[], name: string, post: string[] } | undefined): string {
  if( fix ){
    return [...fix.pre, fix.name, ...fix.post].join("");

  } else {
    return "";
  }
}