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
    kubunLines.push(...breakLines(kubun, this.fontSize, this.kubunWidth));
    nameLines.push(...breakLines(name, this.fontSize, this.nameWidth));
    const n = Math.max(kubunLines.length, nameLines.length);
    for (let i = 0; i < n; i++) {
      lines.push({
        kubun: kubunLines[i] ?? "",
        name: nameLines[i] ?? "",
        tensuu: i === n - 1 ? tensuu : "",
        kaisuu: i === n - 1 ? kaisuu : "",
      })
    }
    return lines;
  }
}
