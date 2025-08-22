export function resolveDrugNameAlias(alias: Record<string, string>, name: string): string[] {
  const result: string[] = [];
  for(let i=0;i<5;i++){
    let bind = alias[name];
    if( bind ){
      if( result.includes(bind) ){
        break;
      } else {
        result.push(bind);
        name = bind;
      }
    } else {
      break;
    }
  }
  return result;
}
