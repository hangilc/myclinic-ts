import { pad } from "@/lib/pad";

export function makeImageFileName(patientId: number, kind: string, date: Date, ser: number): string {
  const m = pad(date.getMonth()+1, 2, "0");
  const d = pad(date.getDate(), 2, "0");
  const H = pad(date.getHours(), 2, "0");
  const M = pad(date.getMinutes(), 2, "0");
  const S = pad(date.getSeconds(), 2, "0");
  return `${patientId}-${kind}-${date.getFullYear()}${m}${d}${H}${M}${S}-${pad(ser, 2, "0")}.jpg`;
}
