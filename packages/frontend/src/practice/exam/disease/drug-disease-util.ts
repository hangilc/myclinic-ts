export function truncateDrugName(name: string): string {
  let i = name.indexOf("錠");
  if( i >= 0 ){
    return name.substring(0, i);
  }
  return name;
}