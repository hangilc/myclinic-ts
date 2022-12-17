export class TextCommand {
  constructor(
    public command: string,
    public body: string,
  ) {}
}

export function listTextCommands(): TextCommand[] {
  return [
    new TextCommand("処方", "院外処方\nＲｐ）\n")
  ];
}