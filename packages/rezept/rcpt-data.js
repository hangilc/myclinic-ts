import { readFileSync } from "fs";
import { Parser } from "xml2js";
export const RcptDataObject = {
    async readFromXmlFile(dataFile) {
        const data = readFileSync(dataFile, "utf8");
        const parser = new Parser({});
        const xml = await parser.parseStringPromise(data);
        console.log(xml["レセプト"]);
        return {
            gengou: "",
            nen: 1,
            month: 1
        };
    }
};
