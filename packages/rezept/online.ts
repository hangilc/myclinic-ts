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
  data.entries.forEach(e => {
    if( e.kouhiList.length > 0 ){
      console.log(e.kouhiList);
    }
  })
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
  data.entries.forEach(e => {
    console.log(resolveRcptShubetsu(e));
  })
  // outRecClinicInfo(dataToRecClinicInfo(data, shahoId));
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

function resolveRcptShubetsu(entry: RcptEntry): number {
  const base = 1112 + entry.kouhiList.length * 10;
  switch(entry.hokenFutan){
    case "六才未満": return base + 2;
    case "家族": return base + 4;
    case "高齢９": case "高齢８": return base + 6;
    case "高齢７": return base + 8;
    case "本人": return base;
    default: throw new Error("Unknown shubetsu: " + entry.hokenShubetsu);
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
