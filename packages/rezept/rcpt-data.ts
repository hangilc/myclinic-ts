import { readFileSync } from "fs"
import { Parser } from "xml2js";

export interface RcptData {
  gengou: string,
  nen: number,
  month: number
}

export const RcptDataObject = {
  async readFromXmlFile(dataFile: string): Promise<RcptData> {
    const data: string = readFileSync(dataFile, "utf8");
    const parser = new Parser({});
    const xml = await parser.parseStringPromise(data);
    console.log(xml["レセプト"]);
    return {
      gengou: "",
      nen: 1,
      month: 1
    };
  }
} 