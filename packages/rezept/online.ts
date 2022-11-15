// Usage: node online.js DATA-FILE

import { RcptData, RcptDataObject, RcptEntry } from "./rcpt-data";

const shahoId = 1;
const kokuhoId = 2;

interface RecClinicInfo {
  shinsaKikanId: number;
  regionCode: string,
  iryoukikanCode: string,
  clinicName: string,
  seikyuuYear: number,
  seikyuuMonth: number,
  phone: string
}

const dataFile = process.argv[2];
run();

async function run() {
  const data = await RcptDataObject.readFromXmlFile(dataFile);
  const shahoEntries: RcptEntry[] = [];
  const kokuhoEntries: RcptEntry[] = [];
  data.entries.forEach(e => {
    const shinsaId = resolveShinsaKikanId(e.hokenshaBangou);
    if( shinsaId === shahoId ){
      shahoEntries.push(e);
    } else {
      kokuhoEntries.push(e);
    }
  });
  outRecClinicInfo(dataToRecClinicInfo(data, shahoId));
  // console.log(JSON.stringify(data, null, 2));
}

function resolveShinsaKikanId(hokenshaBangou: string): number {
  const b = pad(hokenshaBangou, 8, "0");
  switch (b.substring(0, 2)) {
    case "00": case "39": case "67": {
      return kokuhoId;
    }
    default: return shahoId;
  }
}

function outRecClinicInfo(r: RecClinicInfo): void {
  console.log([
    "IR",
    r.shinsaKikanId.toString(),
    r.regionCode,
    "1",
    r.iryoukikanCode,
    "",
    r.clinicName,
    `${r.seikyuuYear}${pad(r.seikyuuMonth, 2, "0")}`,
    "00",
    r.phone
  ].join(","));
}

function dataToRecClinicInfo(data: RcptData, shinsaKikanId: number): RecClinicInfo {
  return {
    shinsaKikanId,
    regionCode: data.regionCode,
    iryoukikanCode: data.iryoukikanCode,
    clinicName: data.clinicName,
    seikyuuYear: gengouToYear(data.gengou, data.nen),
    seikyuuMonth: data.month,
    phone: data.phone
  }
}

function pad(n: number | string, cols: number, c: string): string {
  let r: string;
  if (typeof n === "number") {
    r = n.toString();
  } else {
    r = n;
  }
  while (r.length < cols) {
    r = c + r;
  }
  return r;
}

function gengouToYear(gengou: string, nen: number): number {
  if (gengou === "令和") {
    return nen + (2022 - 4);
  } else {
    throw new Error("Unknown gengou: " + gengou);
  }
}
