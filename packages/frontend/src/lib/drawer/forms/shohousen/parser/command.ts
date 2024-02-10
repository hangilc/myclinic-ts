export interface CommandMemo {
  kind: "memo";
  content: string;
}

export interface OnlineTaiou {
  kind: "online-taiou";
}

export interface ValidUpto {
  kind: "valid-upto";
  date: string;
}

export type ShohousenCommand = CommandMemo | OnlineTaiou | ValidUpto;

const reCommand = /^([^:： 　]+)(?:[:： 　](.*))?/;

export function parseCommand(cmd: string): ShohousenCommand {
  const m = cmd.match(reCommand);
  if( m ){
    const key = m[1];
    const arg = m[2]?.trim();
    switch(key){
      case "memo": return { kind: "memo", content: arg.trim() };
      case "オンライン対応": return { kind: "online-taiou" };
      case "有効期限": return { kind: "valid-upto", date: getDate(arg) }
      default: {
        throw new Error(`Unknown command: ${cmd}`);
      }
    }
  } else {
    throw new Error(`Invalid command: ${cmd}`);
  }
}

function getDate(arg: string) {
  const re = /^\d{4}-\d{2}-\d{2}/;
  if( arg.match(re) ){
    return arg.substring(0, 10);
  } else {
    throw new Error(`Invalid date: ${arg}`)
  }
}