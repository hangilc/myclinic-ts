import { padLeft } from "./pad";

export function formatHokenshaBangou(hokenshaBangou: number): string {
  if (hokenshaBangou < 1000000) {
    let f = hokenshaBangou.toString();
    if( f.length === 5 ){
      f = "0" + f;
      return padLeft(f, 8, " ");
    } else {
      return padLeft(hokenshaBangou, 8, " ");
    }
  } else {
    return padLeft(hokenshaBangou, 8, "0");
  }
}
