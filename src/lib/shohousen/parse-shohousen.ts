import { zenkakuSpace } from "../zenkaku"
const space = "[ 　]"
const digit = "[0-9０-９]"
const reProlog = new RegExp(`^院外処方${space}*\nＲｐ）${space}*\n`);
const rePartStart = new RegExp(`(?<=^|\n)${space}?${digit}+）${space}*`);
const reLeadingSpaces = new RegExp(`^${space}+`)
const commandStart = "@";
const localCommandStart = "@_"
const localCommentCommand = "@_comment:"

export function isShohousen(s: string): boolean {
  return reProlog.test(s);
}

export function stripShohousenProlog(s: string): string {
  return s.replace(reProlog, "");
}

export function isPartStart(s: string): boolean {
  return rePartStart.test(s);
}

export function cut(s: string, re: RegExp): [string, string[]] {
  let flags = re.flags.replace("g", "") + "g";
  re = new RegExp(re, flags)
  const ms = s.matchAll(re);
  let pre: string = "";
  let parts: string[] = [];
  let i = 0;
  for(const m of ms){
    const start = m.index
    if( i === 0 ){
      pre = s.substring(0, start);
    } else {
      parts.push(s.substring(i, start));
    }
    i = start;
  }
  parts.push(s.substring(i));
  return [pre, parts];
}

export function splitToParts(s: string): [string, string[]] {
  return cut(s, rePartStart);
}

export interface PartTemplate {
  lines: string[],
  trails: string[],
  localCommands: string[],
  globalCommands: string[]
}

export function span<T>(list: T[], pred: (t: T) => boolean): [T[], T[]] {
  let i;
  for(i=0;i<list.length;i++){
    const a = list[i];
    if( !pred(a) ){
      break;
    }
  }
  return [list.slice(0, i), list.slice(i)];
}

export function partition<T>(list: T[], pred: (t: T) => boolean): [T[], T[]] {
  return list.reduce(([pos, neg], ele) => {
    if( pred(ele) ){
      pos.push(ele);
    } else {
      neg.push(ele);
    }
    return [pos, neg];
  }, [[], []]);
}

export function parsePartTemplate(s: string): PartTemplate {
  s = s.replace(rePartStart, zenkakuSpace);
  const lines = s.split("\n");
  let [pre, post] = span(lines, a => a.startsWith(zenkakuSpace));
  pre = pre.map(a => a.replace(reLeadingSpaces, ""));
  const [commands, trails] = span(post, a => a.startsWith(commandStart));
  let [localCommands, globalCommands] = 
    partition(commands, c => c.startsWith(localCommandStart));
  localCommands = localCommands.filter(a => a.startsWith(localCommentCommand))
  return {
    lines: pre,
    trails,
    localCommands,
    globalCommands
  };
}
