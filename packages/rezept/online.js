// Usage: node online.js DATA-FILE
import { RcptDataObject } from "./rcpt-data";
const shahoId = 1;
const kokuhoId = 2;
const dataFile = process.argv[2];
run();
async function run() {
    const data = await RcptDataObject.readFromXmlFile(dataFile);
    const shubetsuSet = [];
    const hokenshaBangouSet = [];
    data.entries.forEach(e => {
        if (!shubetsuSet.includes(e.hokenShubetsu)) {
            shubetsuSet.push(e.hokenShubetsu);
        }
        if (!hokenshaBangouSet.includes(e.hokenshaBangou)) {
            hokenshaBangouSet.push(e.hokenshaBangou);
        }
    });
    console.log(shubetsuSet);
    console.log(hokenshaBangouSet);
    // outRecClinicInfo(dataToRecClinicInfo)
    // console.log(JSON.stringify(data, null, 2));
}
function outRecClinicInfo(r) {
    console.log([
        "IR",
        r.shinsaKikanId.toString(),
        r.regionCode,
        "1",
        r.iryoukikanCode,
        "",
        r.clinicName,
        `${r.seikyuuYear}${pad(r.seikyuuMonth, 2, "0")}`,
        "00",
        r.phone
    ].join(","));
}
function dataToRecClinicInfo(data, shinsaKikanId) {
    return {
        shinsaKikanId,
        regionCode: data.regionCode,
        iryoukikanCode: data.iryoukikanCode,
        clinicName: data.clinicName,
        seikyuuYear: gengouToYear(data.gengou, data.nen),
        seikyuuMonth: data.month,
        phone: data.phone
    };
}
function pad(n, cols, c) {
    let r = n.toString();
    while (r.length < cols) {
        r += c;
    }
    return r;
}
function gengouToYear(gengou, nen) {
    if (gengou === "令和") {
        return nen + (2022 - 4);
    }
    else {
        throw new Error("Unknown gengou: " + gengou);
    }
}
