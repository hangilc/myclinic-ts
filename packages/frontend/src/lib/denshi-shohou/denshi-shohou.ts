class Record {
  group: number;
  recordNumber: number;
  code: string;

  constructor(group: number, recordNumber: number, code: string) {
    this.group = group;
    this.recordNumber = recordNumber;
    this.code = code;
  }
}

export class DenshiShohou {
  records: Record[];

  constructor() {
    this.records = [];
  }

  addRecord(group: number, recordNumber: number, values: string[]) {
    this.records.push(new Record(group, recordNumber, values.join(",")));
  }

  医療機関情報(tensuuhyou: 点数表, kikanCode: string, todoufuken: 都道府県, name: string) {
    this.addRecord(2, 1, [
      点数表Map[tensuuhyou],
      kikanCode,
      都道府県Map[todoufuken],
      name
    ]);
  }

  医療機関所在地レコード() {
    this.addRecord(3, 2, [
    ]);
  }

  output(): string {
    const recs: Record[] = [...this.records];
    recs.sort((a, b) => {
      const g = a.group - b.group;
      if( g !== 0 ){
        return g;
      } else {
        return a.recordNumber - b.recordNumber;
      }
    });
    return ["SJ1", ...recs.map(r => r.code)].map(code => `${code}\n`).join("");
  }
}

const 点数表Map = {
  "医科": "1",
  "歯科": "3",
} as const;

export type 点数表 = keyof typeof 点数表Map;

const 都道府県Map = {
  "北海道": "01",
  "青森": "02",
  "岩手": "03",
  "宮城": "04",
  "秋田": "05",
  "山形": "06",
  "福島": "07",
  "茨木": "08",
  "栃木": "09",
  "群馬": "10",
  "埼玉": "11",
  "千葉": "12",
  "東京": "13",
  "神奈川": "14",
  "新潟": "15",
  "富山": "16",
  "石川": "17",
  "福井": "18",
  "山梨": "19",
  "長野": "20",
  "岐阜": "21",
  "静岡": "22",
  "愛知": "23",
  "三重": "24",
  "滋賀": "25",
  "京都": "26",
  "大阪": "27",
  "兵庫": "28",
  "奈良": "29",
  "和歌山": "30",
  "鳥取": "31",
  "島根": "32",
  "岡山": "33",
  "広島": "34",
  "山口": "35",
  "徳島": "36",
  "香川": "37",
  "愛媛": "38",
  "高知": "39",
  "福岡": "40",
  "佐賀": "41",
  "長崎": "42",
  "熊本": "43",
  "大分": "44",
  "宮崎": "45",
  "鹿児島": "46",
  "沖縄": "47",
} as const;

export type 都道府県 = keyof typeof 都道府県Map;