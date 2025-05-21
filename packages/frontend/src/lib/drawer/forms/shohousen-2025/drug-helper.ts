import type { Drug, Senpatsu, Shohou, Usage } from "@/lib/parse-shohou";
import { toZenkaku } from "@/lib/zenkaku";
import { breakLines } from "@/lib/drawer/compiler/break-lines";

export type ShohouData = {
  groups: ShohouGroup[];
  shohouComments: string[];
}

type ShohouGroup = {
  drugs: ShohouDrug[];
  usage: string;
  groupComments: string[];
}

type ShohouDrug = {
  text: string;
  senpatsu?: Senpatsu;
  drugComments: string[];
}

export function handleShohou(shohou: Shohou): ShohouData {
  const shohouData: ShohouData = { groups: [], 
    shohouComments: [] 
  };
  function handleDrug(src: Drug): ShohouDrug {
    const text = drugNameAndAmountLine(src);
    const senpatsu = src.senpatsu;
    const drugComments = src.drugComments;
    return { text, senpatsu, drugComments };
  }
  shohou.groups.forEach(srcGroup => {
    const dstGroup: ShohouGroup = {
      drugs: srcGroup.drugs.map(handleDrug),
      usage: drugUsageLine(srcGroup.usage),
      groupComments: srcGroup.groupComments,
    };
    shohouData.groups.push(dstGroup);
  });
  shohouData.shohouComments = shohou.comments ?? [];
  return shohouData;
}

export function indexLabel(index: number): string {
  return toZenkaku(`${index})`);
}

function drugNameAndAmountLine(drug: Drug): string {
  return `${drug.name}　${drug.amount}${drug.unit}`
}

function drugUsageLine(usage: Usage): string {
  switch (usage.kind) {
    case "days": {
      return `${usage.usage}　${usage.days}日分`;
    }
    case "times": {
      return `${usage.usage}　${usage.times}回分`;
    }
    case "other": {
      return `${usage.usage}`;
    }
  }
}

export interface ShohouLine {
  senpatsu?: Senpatsu;
  index?: string;
  content: string;
}

export function groupToLines(
  group: ShohouGroup, index: number,
  ffontSize: number, lineWidth: number
): ShohouLine[] {
  const lines: ShohouLine[] = [];
  for(let i=0;i<group.drugs.length;i++){
    let drug = group.drugs[i];
    let textLines = breakLines(drug.text, fontSize, lineWidth);
    let dlines: ShohouLine[] = textLines.map(tl => {
      return { content: tl };
    })
    if( i === 0 ){
      dlines[0].index = indexLabel(index);
    }
    if( drug.senpatsu ){
      dlines[0].senpatsu = drug.senpatsu;
    }
  }
  return lines;
}
