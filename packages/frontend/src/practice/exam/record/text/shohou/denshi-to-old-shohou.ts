import type { PrescInfoData, 薬品情報, RP剤情報 } from "@/lib/denshi-shohou/presc-info";
import { unevenDisp } from "@/lib/denshi-shohou/disp/disp-util";
import { toZenkaku } from "@/lib/zenkaku";

export function denshiToOldShohou(data: PrescInfoData): string {
  let lines: string[] = [];

  // Add header
  lines.push("院外処方");
  lines.push("Ｒｐ）");

  // Process each RP group
  data.RP剤情報グループ.forEach((rpGroup, index) => {
    const rpIndex = toZenkaku(`${index + 1})`);

    // Get first drug info
    const firstDrug = rpGroup.薬品情報グループ[0];
    const firstName = firstDrug.薬品レコード.薬品名称;
    const firstAmount = toZenkaku(firstDrug.薬品レコード.分量);
    const firstUnit = firstDrug.薬品レコード.単位名;

    // Format the first line with the drug name and amount
    let firstLine = `${rpIndex}${firstName}　${firstAmount}${firstUnit}`;
    
    // Add uneven dosage information if present
    if (firstDrug.不均等レコード) {
      firstLine += `　（${unevenDisp(firstDrug.不均等レコード)}）`;
    }
    
    // Add drug supplementary information if present
    if (firstDrug.薬品補足レコード && firstDrug.薬品補足レコード.length > 0) {
      firstDrug.薬品補足レコード.forEach(info => {
        firstLine += `　【${info.薬品補足情報}】`;
      });
    }

    // Add part start marker with index and first drug on same line
    lines.push(firstLine);

    // Add remaining drug names and amounts
    for (let i = 1; i < rpGroup.薬品情報グループ.length; i++) {
      const drug = rpGroup.薬品情報グループ[i];
      const name = drug.薬品レコード.薬品名称;
      const amount = toZenkaku(drug.薬品レコード.分量);
      const unit = drug.薬品レコード.単位名;
      
      // Format the drug line with name and amount
      let drugLine = `　　${name}　${amount}${unit}`;
      
      // Add uneven dosage information if present
      if (drug.不均等レコード) {
        drugLine += `　（${unevenDisp(drug.不均等レコード)}）`;
      }
      
      // Add drug supplementary information if present
      if (drug.薬品補足レコード && drug.薬品補足レコード.length > 0) {
        drug.薬品補足レコード.forEach(info => {
          drugLine += `　【${info.薬品補足情報}】`;
        });
      }
      
      lines.push(drugLine);
    }

    // Add usage information
    const usage = rpGroup.用法レコード.用法名称;
    const days = toZenkaku(rpGroup.剤形レコード.調剤数量.toString());
    const daysUnit = rpGroup.剤形レコード.剤形区分 === "内服" ? "日分" : "回分";

    lines.push(`　　${usage}　${days}${daysUnit}`);

    // Add supplementary usage information if present
    if (rpGroup.用法補足レコード && rpGroup.用法補足レコード.length > 0) {
      rpGroup.用法補足レコード.forEach(suppl => {
        lines.push(`　　${suppl.用法補足情報}`);
      });
    }
  });

  // Add remarks if present
  if (data.備考レコード && data.備考レコード.length > 0) {
    data.備考レコード.forEach(remark => {
      lines.push(`@memo:${remark.備考}`);
    });
  }

  // Add diagnostic information if present
  if (data.提供情報レコード?.提供診療情報レコード) {
    data.提供情報レコード.提供診療情報レコード.forEach(info => {
      const drugName = info.薬品名称 ? `【${info.薬品名称}】` : "";
      lines.push(`@memo:${drugName}${info.コメント}`);
    });
  }

  // Add test data if present
  if (data.提供情報レコード?.検査値データ等レコード) {
    data.提供情報レコード.検査値データ等レコード.forEach(test => {
      lines.push(`@memo:${test.検査値データ等}`);
    });
  }
  // Add expiration date if present
  if (data.使用期限年月日) {
    // Format the date as YYYY-MM-DD
    const year = data.使用期限年月日.substring(0, 4);
    const month = data.使用期限年月日.substring(4, 6);
    const day = data.使用期限年月日.substring(6, 8);
    lines.push(`@有効期限:${year}-${month}-${day}`);
  }

  return lines.join("\n") + "\n";
}


