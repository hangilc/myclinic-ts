export function strToHokenTypeRep(str: string): string {
  switch(str){
    case "shahokokuho": return "社保国保";
    case "koukikourei": return "後期高齢";
    case "roujin": return "老人保険";
    case "kouhi": return "公費";
    default: return "???";
  }
}