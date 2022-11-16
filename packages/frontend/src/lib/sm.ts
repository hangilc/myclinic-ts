// StripMargin

const reLeadingSpace = /^\s+/;

export function sm(strings: TemplateStringsArray, ...exprs: any[]): string {
  let result = "";
  for(let i=0;i<exprs.length;i++){
    result += strings[i];
    result += exprs[i].toString();
  }
  result += strings[strings.length - 1];
  if( result.startsWith("\n") ){
    result = result.substring(1);
  }
  let lines: string[] = result.split("\n");
  if( lines.length >= 1 ){
    const first = lines[0];
    const lead: RegExpExecArray | null = reLeadingSpace.exec(first);
    if( lead ){
      const re = new RegExp(`^${lead[0]}`);
      lines = lines.map(line => line.replace(re, ""));
    }
  }
  result = lines.join("\n");
  return result;
}
