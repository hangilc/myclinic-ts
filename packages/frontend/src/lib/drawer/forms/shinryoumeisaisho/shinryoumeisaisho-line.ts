import { breakLines } from "../../compiler/break-lines";

export interface Line {
  kubun: string,
  name: string,
  tensuu: string,
  kaisuu: string,
}

export class LineCompiler {
  fontSize: number;
  kubunWidth: number;
  nameWidth: number;
  tensuuWidth: number;
  kaisuuWidth: number;

  constructor(fontSize: number, kubunWidth: number, nameWidth: number, tensuuWidth: number, kaisuuWidth: number) {
    this.fontSize = fontSize;
    this.kubunWidth = kubunWidth;
    this.nameWidth = nameWidth;
    this.tensuuWidth = tensuuWidth;
    this.kaisuuWidth = kaisuuWidth;
  }

  breakToLines(kubun: string, name: string, tensuu: string, kaisuu: string): Line[] {
    const lines: Line[] = [];
    const kubunLines: string[] = [];
    const nameLines: string[] = [];
    const tensuuLines: string[] = [];
    const kaisuuLines: string[] = [];
    kubunLines.push(...breakLines(kubun, this.fontSize, this.kubunWidth));
    nameLines.push(...breakLines(name, this.fontSize, this.nameWidth));
    tensuuLines.push(...breakLines(tensuu, this.fontSize, this.tensuuWidth));
    kaisuuLines.push(...breakLines(kaisuu, this.fontSize, this.kaisuuWidth));
    const n = Math.max(kubunLines.length, nameLines.length, tensuuLines.length, kaisuuLines.length);
    for (let i = 0; i < n; i++) {
      lines.push({
        kubun: kubunLines[i] ?? "",
        name: nameLines[i] ?? "",
        tensuu: tensuuLines[i] ?? "",
        kaisuu: kaisuuLines[i] ?? "",
      })
    }
    return lines;
  }
}
