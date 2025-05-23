import type { Drug, Senpatsu, Shohou, Usage } from "@/lib/parse-shohou";
import { toZenkaku } from "@/lib/zenkaku";
import { breakLines } from "@/lib/drawer/compiler/break-lines";
import type { DrawerContext } from "@/lib/drawer/compiler/context";
import type { DrugBoxes } from "./drugs";
import * as c from "@/lib/drawer/compiler/compiler"
import { black } from "./helper";
import type { Box } from "@/lib/drawer/compiler/box";

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
  return { groupLines, commentLines, };
}

export function totalLinesOfShohouLines(lines: ShohouLines): number {
  let { groupLines, commentLines } = lines;
  let totalLines = 0;
  for(let line of groupLines){
    totalLines += line.length;
  }
  for(let line of commentLines){
    totalLines += line.length;
  }
  return totalLines;
}

export type ShohouLinesBoxes = DrugBoxes & {
  indexCol: Box;
  drugText: Box;
}

export function drawShohouLines(
  ctx: DrawerContext, boxes: ShohouLinesBoxes, shohouLines: ShohouLines,
  font: string, leading: number,
): number {
  let dy = 0;
  c.withFontAndColor(ctx, font, black, () => {
    let fontSize = c.getFontSizeOf(ctx, font)
    for(let glines of shohouLines.groupLines){
      for(let line of glines){
        if( line.senpatsu === "henkoufuka" ){
          c.drawText(ctx, "✓", boxes.col1, "center", "top", { dy });
        } else if( line.senpatsu === "kanjakibou" ){
          c.drawText(ctx, "✓", boxes.col2, "center", "top", { dy });
        }
        if( line.index ){
          c.drawText(ctx, line.index, boxes.indexCol, "left", "top", { dy });
        }
        c.drawText(ctx, line.content, boxes.drugText, "left", "top", { dy });
        dy += fontSize + leading;
      }
    }
    for(let coms of shohouLines.commentLines) {
      for(let com of coms){
        c.drawText(ctx, com, boxes.drugs, "left", "top", { dy });
        dy += fontSize + leading;
      }
    }
  });
  return dy;
}

export function breakShohouPages(
  shohouLines: ShohouLines, fontSize: number, leading: number, boxHeight: number,
): ShohouLines[] {
  if( boxHeight < fontSize ){
    throw new Error("too small box height");
  }
  let result: ShohouLines[] = [];
  let lineHeight = fontSize + leading;
  let top = -leading;
  let srcGroups: ShohouLine[][] = shohouLines.groupLines;
  let dstGroups: ShohouLine[][] = [];
  while(srcGroups.length > 0) {
    let group = srcGroups[0];
    let reqHeight = lineHeight * group.length;
    let bottom = top + reqHeight;
    if( bottom <= boxHeight ){
      dstGroups.push(group);
      top = bottom;
      srcGroups.shift();
    } else {
      const dst: ShohouLines = {
        groupLines: dstGroups,
        commentLines: [],
      };
      result.push(dst);
      dstGroups = [];
      top = -leading;
    }
  }
  let srcComments: string[][] = shohouLines.commentLines;
  let dstComments: string[][] = [];
  while(srcComments.length > 0){
    let coms = srcComments[0];
    let reqHeight = lineHeight * coms.length;
    let bottom = top + reqHeight;
    if( bottom <= boxHeight ){
      dstComments.push(coms);
      top = bottom;
      srcComments.shift();
    } else {
      const dst: ShohouLines = {
        groupLines: dstGroups,
        commentLines: dstComments,
      };
      result.push(dst);
      dstGroups = [];
      dstComments = [];
    }
  }
  if( dstGroups.length > 0 || dstComments.length > 0 ){
    const dst: ShohouLines = {
      groupLines: dstGroups,
      commentLines: dstComments,
    };
    result.push(dst);
    dstGroups = [];
    dstComments = [];
  }
  return result;
}

