import api from "@/lib/api";
import { sqlDateToDate } from "@/lib/date-util";
import { probeFaxToPharmacyText } from "@/lib/shohousen-text-helper";
import type { ClinicInfo, Patient } from "myclinic-model";

export function defaultDates(today: Date): [Date, Date] {
  const d = today.getDate();
  if( d >= 1 && d <= 15 ){
    const fromDate = new Date(today);
    fromDate.setDate(1);
    fromDate.setMonth(fromDate.getMonth() - 1);
    fromDate.setDate(15);
    const uptoDate = new Date(today);
    uptoDate.setDate(0);
    return [fromDate, uptoDate];
  } else {
    const fromDate = new Date(today);
    fromDate.setDate(1);
    const uptoDate = new Date(today);
    uptoDate.setDate(15);
    return [fromDate, uptoDate];
  }
}

export interface FaxShohousen {
  patient: Patient,
  pharma: string,
  visitedAt: string,
}

export async function probeFaxShohousen(visitId: number): Promise<FaxShohousen | undefined> {
  const texts = await api.listTextForVisit(visitId);
  for(let text of texts){
    const p = probeFaxToPharmacyText(text.content);
    if( p !== undefined ){
      const visit = await api.getVisit(visitId);
      const patient = await api.getPatient(visit.patientId);
      return { patient, pharma: p, visitedAt: visit.visitedAt };
    }
  }
  return undefined;
}

export interface PharmaData {
  name: string;
  fax: string;
  tel: string;
  addr: string;
  labelAddr: string;
}

export async function fetchPharmaData(): Promise<Record<string, PharmaData>> {
  const dataStr = await api.getPharmaData();
  const dataMap = parsePharmaData(dataStr);
  const addr = await api.getPharmaAddr();
  for(let fax in addr) {
    const d = dataMap[fax];
    if( d ){
      d.labelAddr = addr[fax];
    }
  }
  return dataMap;
}

function parsePharmaData(data: string): Record<string, PharmaData> {
  const items = data.split(/\r?\n(?:\s*\r?\n)+/);
  const result: Record<string, PharmaData> = {};
  items.forEach(item => {
    const d = parsePharmaItem(item);
    if( d ){
      result[d.fax] = d;
    }
  });
  return result;
}

function parsePharmaItem(src: string): PharmaData | undefined {
  const lines = src.split(/\r?\n/);
  let name: string | undefined = undefined;
  let tel: string | undefined = undefined;
  let fax: string | undefined = undefined;
  let addr: string | undefined = undefined;
  lines.forEach(line => {
    line = line.trim();
    let m = line.match(/^【(.+)】/);
    if( m ){
      name = m[1];
      return;
    }
    m = line.match(/^tel:\s*([0-9-]+)/);
    if( m ){
      tel = m[1];
      return;
    }
    m = line.match(/^fax:\s*([+0-9-]+)/);
    if( m ){
      fax = m[1];
      return;
    }
    m = line.match(/^(〒.+)/);
    if( m ){
      addr = m[1];
      return;
    }
  });
  if( name && fax && addr ){
    return {
      name, fax, tel: tel ?? "", addr, labelAddr: ""
    }
  } else {
    return undefined;
  }
}

export interface FaxedShohousenRecord {
  name: string;
  visitedAt: string;
}

export interface FaxedShohousenItem {
  pharmaName: string;
  pharmaFax: string;
  records: FaxedShohousenRecord[];
}

export function mkLetterText(pharma: string, fromDate: Date, uptoDate: Date, records: FaxedShohousenRecord[],
    clinicInfo: ClinicInfo): string[] {
  function formatDate(d: Date): string {
    return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`
  }
  const lines: string[] = [];
  lines.push(pharma);
  lines.push("担当者様");
  lines.push("");
  lines.push(`${formatDate(fromDate)}から${formatDate(uptoDate)}までに当院からファックスした処方箋の原本です。`);
  lines.push(`${records.length}件`);
  lines.push("");
  records.forEach(rec => {
    const d = sqlDateToDate(rec.visitedAt);
    lines.push(`${rec.name} ${formatDate(d)}`);
  });
  lines.push("");
  lines.push(`${formatDate(new Date())}`);
  lines.push(clinicInfo.address);
  lines.push(`電話　${clinicInfo.tel}`);
  lines.push(clinicInfo.name);
  lines.push(clinicInfo.doctorName);

  return lines;
}
