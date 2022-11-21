import { cut, type CutText, type CutMatch } from "@/lib/regexp-util";

const phoneNumberPattern = /(?:\+81)?[-0-9]+/g;

function normalize(s: string): string {
  s = s.replaceAll("-", "");
  if( !s.startsWith("+81") ){
    if( s.length === 8 ){
      s = "3" + s;
    }
  }
  s = s.replace(/^0/, "");
  if( !s.startsWith("+81") ){
    s = "+81" + s;
  }
  return s;
}

export function replacePhoneNumber(s: string, f: (phoneNumber: string) => string): string {
  return s.replaceAll(phoneNumberPattern, s => {
    const n: string = normalize(s);
    return f(n);
  });
}

export function splitPhoneNumber(s: string): (CutText | CutMatch)[] {
  return cut(s, phoneNumberPattern)
}


