import { cut, CutText  } from "@/lib/regexp-util";

const phoneNumberProbePattern = /(?:\+81)?[-0-9]+/g;

const fullLocalPattern = /^\+81[^0]\d{8}$/;
const fullMobilePattern = /^\+81[^0]0\d{8}$/;
const domesticPattern = /^0([^0]0?\d{8})$/;
const localPattern = /^\d{8}$/;
const localPrefix = "3";

export function normalize(s: string): string | undefined {
  s = s.trim().replaceAll("-", "");
  if( fullLocalPattern.test(s) || fullMobilePattern.test(s) ){
    return s;
  }
  let m = domesticPattern.exec(s);
  if( m ){
    return "+81" + m[1];
  }
  m = localPattern.exec(s);
  if( m ){
    return "+81" + localPrefix + m[1];
  }
  return undefined;
}

export class PhoneMatch {
  constructor(
    public orig: string,
    public phoneNumber: string
  ) {}
}

export function splitPhoneNumber(s: string): (CutText | PhoneMatch)[] {
  function handler(m: string): CutText | PhoneMatch {
    const n = normalize(m);
    if( n ){
      return new PhoneMatch(m, n);
    } else {
      return new CutText(m);
    }
  }
  return cut<PhoneMatch>(s, phoneNumberProbePattern, handler);
}


