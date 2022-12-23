export class TextCommand {
  constructor(
    public command: string,
    public body: string,
  ) {}
}

export function listTextCommands(): TextCommand[] {
  return [
    new TextCommand("院外処方", "院外処方\nＲｐ）\n"),
    new TextCommand("0410対応", "@0410対応＋\n"),
    new TextCommand("インフルエンザ", "インフルエンザ予防接種。"),
    new TextCommand("コロナワクチン", "コロナワクチン５回目接種, BA4,BA5。"),
  ];
}