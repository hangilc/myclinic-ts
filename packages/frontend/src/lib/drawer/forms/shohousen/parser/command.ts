export interface CommandMemo {
  kind: "memo";
  content: string;
}

export type ShohousenCommand = CommandMemo;

export function parseCommand(cmd: string): ShohousenCommand {

}