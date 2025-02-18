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
  const debug =  false;
  if( debug ){ console.log("drugName", drugName)}
  for (let item of drugDiseases) {
    if (drugName.includes(item.drugName)) {
<<<<<<< HEAD
      if( debug ) { console.log("name match", item); }
      for (let diseaseName of diseaseNames) {
        if (diseaseName.includes(item.diseaseName)) {
=======
      for (let diseaseName of diseaseNames) {
        if (item.diseaseName.includes(diseaseName)) {
>>>>>>> denshi-conv
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