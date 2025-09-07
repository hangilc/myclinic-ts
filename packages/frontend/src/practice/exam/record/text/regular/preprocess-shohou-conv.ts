import type { PrescInfoData, 薬品情報, 薬品補足レコード } from "@/lib/denshi-shohou/presc-info";
import { toHankaku, toZenkaku } from "@/lib/zenkaku";

export function preprocessPrescInfoForConv(data: PrescInfoData) {
  for (let group of data.RP剤情報グループ) {
    for (let drug of group.薬品情報グループ) {
      if (drug.薬品レコード.薬品コード === "") {
        preprocess(drug);
      }
    }
  }
}

type PreprocessProc = (drug: 薬品情報, name: string, amount: string, unit: string) => boolean;


function preprocess(drug: 薬品情報) {
  const name = drug.薬品レコード.薬品名称;
  const amount = drug.薬品レコード.分量;
  const unit = drug.薬品レコード.単位名;
  const procs: PreprocessProc[] = [procLiquidOrPack]
  for (const proc of procs) {
    if (proc(drug, name, amount, unit)) {
      return;
    }
  }
}

function procLiquidOrPack(drug: 薬品情報, name: string, amount: string, unit: string): boolean {
  const liquidOrPackMatch = /^(.+)(mL|ｍＬ|g|ｇ)$/.exec(name);
  if (!liquidOrPackMatch) {
    return false;
  }
  const liquidOrPackUnitAmountMatch = /([0-9０-９.．]+)$/.exec(liquidOrPackMatch[1]);
  if (!liquidOrPackUnitAmountMatch) {
    return false;
  }
  const unitAmount = Number(toHankaku(liquidOrPackUnitAmountMatch[1]));
  if (isNaN(unitAmount)) {
    return false;
  }
  const amountValue = Number(toHankaku(amount));
  if (isNaN(amountValue)) {
    return false;
  }
  drug.薬品レコード.分量 = toZenkaku((unitAmount * amountValue).toString());
  drug.薬品レコード.単位名 = toZenkaku(liquidOrPackMatch[2]);
  if (amountValue !== 1) {
    const sup = `${toZenkaku(unitAmount.toString())}${toZenkaku(liquidOrPackMatch[2])}${toZenkaku(amountValue.toString())}${unit}`;
    addSuppl(drug, sup);
  }
  return true;
}

function procパタノール(drug: 薬品情報, name: string, amount: string, unit: string): boolean {
  if (name === "パタノール点眼液０．１％５ｍＬ" && unit === "瓶") {
    const a = Number(toHankaku(amount));
    if (!isNaN(a)) {
      const total = 5 * a;
      drug.薬品レコード.分量 = toZenkaku(total.toString());
      drug.薬品レコード.単位名 = "ｍＬ";
      if (a !== 1) {
        addSuppl(drug, `５ｍＬ${toZenkaku(a.toString())}瓶`)
      }
    }
  }
  return false;
}

function procアローゼン(drug: 薬品情報, name: string, amount: string, unit: string): boolean {
  const m = /^アローゼン顆粒０．５ｇ$/.exec(name);
  const n = /^[0-9０-９.．]+$/.exec(amount);
  if (m && n && unit === "包") {
    const a = Number(toHankaku(n[0]));
    if (!isNaN(a)) {
      const total: number = a * 0.5;
      drug.薬品レコード.薬品名称 = "アローゼン顆粒";
      drug.薬品レコード.分量 = toZenkaku(total.toString());
      drug.薬品レコード.単位名 = "ｇ";
      if (a !== 1) {
        const hou = toZenkaku((total / 0.5).toString());
        addSuppl(drug, `０．５ｇ${hou}包`);
      }
      return true;
    }
  }
  return false;
}

function addSuppl(drug: 薬品情報, suppl: string) {
  const rec: 薬品補足レコード = { "薬品補足情報": suppl }
  if (drug.薬品補足レコード == undefined) {
    drug.薬品補足レコード = [rec];
  } else {
    drug.薬品補足レコード.push(rec);
  }
}