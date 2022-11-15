import { readFileSync } from "fs";
import { Parser } from "xml2js";
export const RcptDataObject = {
    async readFromXmlFile(dataFile) {
        const data = readFileSync(dataFile, "utf8");
        const parser = new Parser({});
        const xml = await parser.parseStringPromise(data);
        const root = xml['レセプト'];
        return {
            gengou: root["元号"][0],
            nen: parseInt(root["年"][0]),
            month: parseInt(root["月"][0]),
            regionCode: root["都道府県番号"][0],
            iryoukikanCode: formatIryoukikanCode(root["医療機関コード"][0]),
            address: root["医療機関住所"][0],
            phone: formatPhone(root["医療機関電話"][0]),
            clinicName: root["医療機関名称"][0],
            entries: root['請求'].map(xmlToEntry)
        };
    }
};
function formatIryoukikanCode(s) {
    return s.replaceAll(".", "");
}
function formatPhone(s) {
    return s.replaceAll(/\s*[)(]\s*/g, "-");
}
function xmlToEntry(xml) {
    return {
        patientId: parseInt(xml["患者番号"][0]),
        patientName: xml["氏名"][0],
        sex: xml["性別"][0],
        birthday: formatBirthday(xml["生年月日"][0]),
        hokenShubetsu: xml["保険種別"][0],
        hokenTandoku: xml["保険単独"][0],
        hokennFutan: xml["保険負担"][0],
        kyuufuWariai: xml["給付割合"][0],
        tokkijikou: resolveOptional(xml, "特記事項"),
        hokenshaBangou: xml["保険者番号"][0],
        hihokenshaKigou: xml["被保険者記号"][0],
        hihokenshaBangou: xml["被保険者番号"][0],
        kouhiList: resolveKouhiList(xml),
        edaban: resolveOptional(xml, "被保険者枝番"),
        shouki: xml["症状詳記"][0],
        byoumeiList: xml["傷病名"].map(xmlToByoumei),
        jushinList: xml["受診"].map(xmlToJushin),
    };
}
function resolveKouhiList(xml) {
    const list = [];
    if (xml["公費1負担者番号"]) {
        list.push({
            futansha: parseInt(xml["公費1負担者番号"][0]),
            jukyuusha: parseInt(xml["公費1受給者番号"][0])
        });
    }
    if (xml["公費2負担者番号"]) {
        list.push({
            futansha: parseInt(xml["公費2負担者番号"][0]),
            jukyuusha: parseInt(xml["公費2受給者番号"][0])
        });
    }
    if (xml["公費3負担者番号"]) {
        list.push({
            futansha: parseInt(xml["公費3負担者番号"][0]),
            jukyuusha: parseInt(xml["公費3受給者番号"][0])
        });
    }
    return list;
}
function resolveOptional(xml, key, defaultValue = "") {
    const val = xml[key];
    return val ? val[0] : defaultValue;
}
function formatBirthday(s) {
    return formatDate(s);
}
function formatDate(s) {
    return s.replaceAll("-", "");
}
function xmlToByoumei(xml) {
    return {
        name: xml["名称"][0],
        startDate: formatDate(xml["診療開始日"][0])
    };
}
function formatJushinDate(s) {
    return formatDate(s).substring(0, 10);
}
function xmlToJushin(xml) {
    return {
        visitDate: formatJushinDate(xml["受診日"][0]),
        shinryouList: xml["診療"].map(xmlToShinryou),
    };
}
function xmlToShinryou(xml) {
    return {
        shinryoucode: parseInt(xml["診療コード"][0]),
        name: xml["名称"][0],
        tensuu: xml["点数"][0],
        shuukeisaki: xml["集計先"][0],
    };
}
