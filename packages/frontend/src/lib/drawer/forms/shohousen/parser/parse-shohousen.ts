let reStart = /^([ ＿]*[0-9０-９]+[)）])|@/mg;

export function parseShohousen(content: string) {
  const starts = extractByStarter(reStart, content);

}


export function extractChunks(content: string): string[] {
  return extractByStarter(reStart, content);

}

function extractByStarter(re: RegExp, text: string): string[] {
  const ms = text.matchAll(re);
  const starts: number[] = [];
  for (let m of ms) {
    if (m.index !== undefined) {
      starts.push(m.index);
    }
  }
  const result: string[] = [];
  starts.push(text.length);
  let start = starts[0];
  for(let j=1;j<starts.length;j++){
    const end = starts[j];
    result.push(text.substring(start, end));
    start = end;
  }
  return result;
}