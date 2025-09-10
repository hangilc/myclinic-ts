import { toHankaku, toZenkaku } from "@/lib/zenkaku";

export function fixUnitConv(
  drugName: string,
  origAmount: string,
  origUnit: string,
  newUnit: string,
):
  | {
    newAmount: string;
    suppls: string[];
  }
  | undefined {
  console.log("enter fixUnitConv", drugName, origAmount, origUnit, newUnit);
  const packUnitMatch = /^(.+)(mL|ｍＬ|g|ｇ|mg|ｍｇ)$/.exec(drugName);
  if (!packUnitMatch) {
    return undefined;
  }
  const packUnit: string = toZenkaku(packUnitMatch[2]);
  if (packUnit !== newUnit) {
    return undefined;
  }
  const packAmountMatch = /([0-9０-９.．]+)$/.exec(packUnitMatch[1]);
  if (!packAmountMatch) {
    return undefined;
  }
  const packAmount = Number(toHankaku(packAmountMatch[1]));
  if (isNaN(packAmount)) {
    return undefined;
  }
  const origAmountValue: number = Number(toHankaku(origAmount));
  if (isNaN(origAmountValue)) {
    return undefined;
  }
  const total = packAmount * origAmountValue;
  const suppl = `${toZenkaku(packAmount.toString())}${packUnit}${toZenkaku(origAmount)}${toZenkaku(origUnit)}`;
  return { newAmount: toZenkaku(total.toString()), suppls: [suppl] };
  return undefined;
}