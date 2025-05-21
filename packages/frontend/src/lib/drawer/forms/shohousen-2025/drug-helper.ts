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

function drugToLines(
  drug: ShohouDrug,
  fontSize: number, lineWidth: number
): ShohouLine[] {
  let ss: string[] = breakLines(drug.text, fontSize, lineWidth);
  for(let com of drug.drugComments){
    let cs = breakLines(com, fontSize, lineWidth);
    ss.push(...cs);
  }
  let lines: ShohouLine[] = ss.map(s => ({ content: s }));
  if( drug.senpatsu && lines.length > 0 ){
    lines[0].senpatsu = drug.senpatsu;
  }
  return lines;
}

function groupToLines(
  group: ShohouGroup, index: number,
  fontSize: number, lineWidth: number
): ShohouLine[] {
  const lines: ShohouLine[] = [];
  
  function add(s: string) {
    let ss = breakLines(s, fontSize, lineWidth);
    let ls: ShohouLine[] = ss.map(s => ({ content: s }));
    lines.push(...ls);
  }
  
  for(let drug of group.drugs){
    let dlines = drugToLines(drug, fontSize, lineWidth);
    lines.push(...dlines);
  }
  add(group.usage);
  group.groupComments.forEach(add);
  if( lines.length > 0 ){
    lines[0].index = indexLabel(index);
  }
  return lines;
}

export interface ShohouLines {
  groupLines: ShohouLine[][];
  commentLines: string[][];
  totalLines: number;
}

export function shohouToLines(
  shohou: Shohou, fontSize: number, lineWidth: number
): ShohouLines {
  const data = handleShohou(shohou);
  const groupLines: ShohouLine[][] = [];
  const commentLines: string[][] = [];
  let index = 1;
  for(let g of data.groups){
    let lines = groupToLines(g, index++, fontSize, lineWidth);
    groupLines.push(lines);
  }
  for(let c of data.shohouComments){
    let lines = breakLines(c, fontSize, lineWidth);
    commentLines.push(lines);
  }
  let totalLines = 0;
  for(let line of groupLines){
    totalLines += line.length;
  }
  for(let line of commentLines){
    totalLines += line.length;
  }
  return { groupLines, commentLines, totalLines };
}
