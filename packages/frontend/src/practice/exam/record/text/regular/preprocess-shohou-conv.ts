import type { PrescInfoData, 薬品情報, 薬品補足レコード } from "@/lib/denshi-shohou/presc-info";
import { toZenkaku } from "@/lib/zenkaku";

export function preprocessPrescInfoForConv(data: PrescInfoData) {
  for(let group of data.RP剤情報グループ){
    for(let drug of group.薬品情報グループ){
      if( drug.薬品レコード.薬品コード === ""){
        preprocess(drug);
      }
    }
  }
}


function preprocess(drug: 薬品情報) {
  const name = drug.薬品レコード.薬品名称;
  const amount = drug.薬品レコード.分量;
  const unit = drug.薬品レコード.単位名;
  if( procアローゼン(drug, name, amount, unit) ){
    return;
  }
}

function procアローゼン(drug: 薬品情報, name: string, amount: string, unit: string): boolean {
  const m = /^アローゼン顆粒０．５ｇ$/.exec(name);
  const n = /^[0-9０-９.．]+$/.exec(amount);
  if( m && n && unit === "包") {
    const a = Number(n[0]);
    if( !isNaN(a) ){
      const total: number = a * 0.5;
      drug.薬品レコード.薬品名称 = "アローゼン顆粒";
      drug.薬品レコード.分量 = toZenkaku(total.toString());
      drug.薬品レコード.単位名 = "ｇ";
      if( a !== 1 ){
        const hou = toZenkaku((total / 0.5).toString());
        const rec: 薬品補足レコード = { "薬品補足情報" : `０．５ｇ${hou}包` }
        if( drug.薬品補足レコード == undefined ){
          drug.薬品補足レコード = [rec];
        } else {
          drug.薬品補足レコード.push(rec);
        }
      }
      return true;
    }
  }
  return false;
}