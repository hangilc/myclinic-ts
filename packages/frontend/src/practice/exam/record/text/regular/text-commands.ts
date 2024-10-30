export class TextCommand {
  constructor(
    public command: string,
    public body: string,
  ) {}
}

export function listTextCommands(): TextCommand[] {
  return [
    new TextCommand("院外処方", "院外処方\nＲｐ）\n"),
    new TextCommand("オンライン対応", "@memo:オンライン対応（原本郵送）\n"),
    new TextCommand("インフルエンザ", "インフルエンザ予防接種。"),
    new TextCommand("コロナワクチン", "コロナワクチン７回目接種。"),
  ];
}