// Usage: node online.js DATA-FILE
import { RcptDataObject } from "./rcpt-data";
const dataFile = process.argv[2];
run();
async function run() {
    const data = await RcptDataObject.readFromXmlFile(dataFile);
    console.log(JSON.stringify(data, null, 2));
}
