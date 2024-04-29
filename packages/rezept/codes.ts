export const 診査支払い機関コード = {
  "社保基金": 1,
  "国健連合": 2,
} as const;

export type 診査支払い機関コードName = keyof typeof 診査支払い機関コード;
export type 診査支払い機関コードCode = valueof<typeof 診査支払い機関コード>;

export const 都道府県コード: Record<string, string> = {
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
}

export const KouhiOrder: number[] = [
  13, 14, 18, 29, 30, 10, 11, 20, 21, 15,
  16, 24, 22, 28, 17, 79, 19, 23, 52, 54,
  51, 38, 53, 66, 62, 25, 12
];

export const KouhiOrderMap: Record<number, number> = calcKouhiOrderMap();

function calcKouhiOrderMap(): Record<number, number> {
  const map: Record<number, number> = {};
  KouhiOrder.forEach((k, i) => {
    map[k] = i + 1;
  });
  return map;
}

export const RezeptShubetuCodeOffset = {
  "本人": 2,
  "未就学者": 4,
  "家族": 6,
  "高齢受給一般": 8,
  "高齢受給７割": 0,
} as const;

export const RezeptShubetsuCodeBase = {
  "社保国保単独": 1110,
  "社保国保・１公費併用": 1120,
  "社保国保・２公費併用": 1130,
  "社保国保・３公費併用": 1140,
  "社保国保・４公費併用": 1150,
  "公費単独": 1212,
  "２公費": 1222,
  "３公費": 1232,
  "４公費": 1242,
  "後期高齢単独": 1310,
  "後期高齢・１公費併用": 1320,
  "後期高齢・２公費併用": 1330,
  "後期高齢・３公費併用": 1340,
  "後期高齢・４公費併用": 1350,
} as const;

export const 男女区分コード = {
  "男": 1,
  "女": 2,
} as const;

export const レセプト特記事項コード = {
  "公": "01",
  "長": "02",
  "長処": "03",
  "後保": "04",
  "老併": "07",
  "老健": "08",
  "施": "09",
  "第三": "10",
  "薬治": "11",
  "器治": "12",
  "先進": "13",
  "制超": "14",
  "長２": "16",
  "上位": "17",
  "一般": "18",
  "低所": "19",
  "二割": "20",
  "高半": "21",
  "多上": "22",
  "出産": "25",
  "区ア": "26",
  "区イ": "27",
  "区ウ": "28",
  "区エ": "29",
  "区オ": "30",
  "多ア": "31",
  "多イ": "32",
  "多ウ": "33",
  "多エ": "34",
  "多オ": "35",
  "加治": "36",
  "申出": "37",
  "医併": "38",
  "医療": "39",
  "区カ": "41",
  "区キ": "42",
  "多カ": "43",
  "多キ": "44",
} as const;

type valueof<T> = T[keyof T];

export type レセプト特記事項コードName = keyof typeof レセプト特記事項コード;
export type レセプト特記事項コードCode = valueof<typeof レセプト特記事項コード>;

export function isレセプト特記事項コードName(k: string): k is レセプト特記事項コードName {
  return Object.keys(レセプト特記事項コード).includes(k);
}

export const 負担者種別コード = {
  "保険": 1,
  "第１公費負担医療": 2,
  "第２公費負担医療": 3,
  "第３公費負担医療": 4,
  "第４公費負担医療": 5,
} as const;

export type 負担者種別コードName = keyof typeof 負担者種別コード;
export type 負担者種別コードCode = valueof<typeof 負担者種別コード>;

export function is負担者種別コードName(k: string): k is 負担者種別コードName {
  return Object.keys(負担者種別コード).includes(k);
}

export const 確認区分コード = {
  "保険医療機関・薬局窓口等": "01",
  "審査支払機関に請求後（変更なし）": "02",
  "審査支払機関に請求後（確認不能）": "03",
  "審査支払機関に請求後（振替）": "04",
  "審査支払機関に請求後（分割）": "05",
  "審査支払機関に請求後（資格喪失・レセプト記載の保険者への請求）": "06",
  "審査支払機関に請求後（資格喪失・証回収後）": "07",
  "審査支払機関に請求後（資格喪失・死亡）": "08",
  "審査支払機関に請求後（枝番特定）": "09",
  "保険者等に請求後（振替）": "11",
  "保険者等に請求後（分割）": "12",
  "保険者等に請求後（変更不能）": "13",
  "保険者等に請求後（枝番特定）": "14",
} as const;

export type 確認区分コードName = keyof typeof 確認区分コード;
export type 確認区分コードCode = valueof<typeof 確認区分コード>;

export function is確認区分コードName(k: string): k is 確認区分コードName {
  return Object.keys(確認区分コード).includes(k);
}

export const 転帰区分コード = {
  "治ゆ、死亡、中止以外": 1,
  "治ゆ": 2,
  "死亡": 3,
  "中 止（転医）": 4,
} as const;

export type 転帰区分コードName = keyof typeof 転帰区分コード;
export type 転帰区分コードCode = valueof<typeof 転帰区分コード>;

export function is転帰区分コードName(k: string): k is 転帰区分コードName {
  return Object.keys(転帰区分コード).includes(k);
}

export const 診療識別コード = {
  "全体に係る識別コード": "01",
  "初診": "11",
  "再診": "12",
  "医学管理": "13",
  "在宅": "14",
  "投薬・内服": "21",
  "投薬・屯服": "22",
  "投薬・外用": "23",
  "投薬・調剤": "24",
  "投薬・処方": "25",
  "投薬・麻毒": "26",
  "投薬・調基": "27",
  "投薬・その他": "28",
  "注射・皮下筋肉内": "31",
  "注射・静脈内": "32",
  "注射・その他": "33",
  "薬剤料減点": "39",
  "処置": "40",
  "手術": "50",
  "麻酔": "54",
  "検査・病理": "60",
  "画像診断": "70",
  "その他": "80",
  "全体に係る識別コード９９": "99",
} as const;

export const 診療識別コードvalues: string[] = Object.values(診療識別コード);

export type 診療識別コードName = keyof typeof 診療識別コード;
export type 診療識別コードCode = valueof<typeof 診療識別コード>;

export const rev診療識別コード: Record<string, 診療識別コードName> = {};
{
  for (let k of Object.keys(診療識別コード)) {
    const key = k as 診療識別コードName;
    const v = 診療識別コード[key];
    rev診療識別コード[v] = key;
  }
}

export function is診療識別コードName(k: string): k is 診療識別コードName {
  return Object.keys(診療識別コード).includes(k);
}

export function is診療識別コードCode(arg: string): arg is 診療識別コードCode {
  for (const v of Object.values(診療識別コード)) {
    if (v === arg) {
      return true;
    }
  }
  return false;
}

export function castTo診療識別コードCode(arg: string): 診療識別コードCode {
  if (is診療識別コードCode(arg)) {
    return arg;
  } else {
    throw new Error("Invalid 診療識別コード: " + arg);
  }
}

export function sort診療識別コードCodeList(list: 診療識別コードCode[]): 診療識別コードCode[] {
  list.sort((a, b) => a.localeCompare(b));
  return list;
}

export const 負担区分コード = {
  "H": "1",
  "1": "5",
  "2": "6",
  "3": "B",
  "4": "C",
  "H1": "2",
  "H2": "3",
  "H3": "E",
  "H4": "G",
  "12": "7",
  "13": "H",
  "14": "I",
  "23": "J",
  "24": "K",
  "34": "L",
  "H12": "4",
  "H13": "M",
  "H14": "N",
  "H23": "O",
  "H24": "P",
  "H34": "Q",
  "123": "R",
  "124": "S",
  "134": "T",
  "234": "U",
  "H123": "V",
  "H124": "W",
  "H134": "X",
  "H234": "Y",
  "1234": "Z",
  "H1234": "9",
} as const;

export type 負担区分コードName = keyof typeof 負担区分コード;
export type 負担区分コードCode = valueof<typeof 負担区分コード>;

export const 負担区分コードRev: Map<負担区分コードCode, 負担区分コードName> = new Map();
for (const k in 負担区分コード) {
  const n = k as 負担区分コードName
  const v = 負担区分コード[n];
  負担区分コードRev.set(v, n);
}

export function is負担区分コードName(k: string): k is 負担区分コードName {
  return Object.keys(負担区分コード).includes(k);
}

export function is負担区分コードCode(k: string): k is 負担区分コードCode {
  for (let code of Object.values(負担区分コード)) {
    if (code === k) {
      return true;
    }
  }
  return false;
}

export function 負担区分コードNameOf(code: 負担区分コードCode): 負担区分コードName {
  return 負担区分コードRev.get(code)!;
}

export function 負担区分コードCodeOf(name: 負担区分コードName): 負担区分コードCode {
  return 負担区分コード[name];
}

export function compare負担区分コードName(a: 負担区分コードName, b: 負担区分コードName): number {
  if (a.startsWith("H") && !b.startsWith("H")) {
    return 1;
  }
  if (!a.startsWith("H") && b.startsWith("H")) {
    return -1;
  }
  return a.localeCompare(b);
}

export const 症状詳記区分コード = {
  "患者の主たる疾患（合併症を含む。）の診断根拠となった臨床症状": "01",
  "患者の主たる疾患（合併症を含む。）の診断根拠となった臨床症状の診察・検査所見": "02",
  "主な治療行為（手術、処置、薬物治療等）の必要性": "03",
  "主な治療行為（手術、処置、薬物治療等）の経過": "04",
  "診療報酬明細書の合計点数が１００万点以上の場合における薬剤に係る症状等": "05",
  "診療報酬明細書の合計点数が１００万点以上の場合における処置に係る症状等": "06",
  "その他": "07",
  "医薬品医療機器等法に規定する治験に係る治験概要": "50",
  "疾患別リハビリテーション（心大血管疾患、脳血管疾患等、廃用症候群、運動器及び呼吸器）に係る治療継続の理由等の記載": "51",
  "廃用症候群リハビリテーション料を算定する場合の、廃用をもたらすに至った要因等の記載": "52",
  "上記以外": "90",
}

export type 症状詳記区分コードName = keyof typeof 症状詳記区分コード;
export type 症状詳記区分コードCode = valueof<typeof 症状詳記区分コード>;

export function is症状詳記区分コードName(k: string): k is 症状詳記区分コードName {
  return Object.keys(症状詳記区分コード).includes(k);
}

export function is症状詳記区分コードCode(arg: string): arg is 症状詳記区分コードCode {
  for (const v of Object.values(症状詳記区分コード)) {
    if (v === arg) {
      return true;
    }
  }
  return false;
}

export function castTo症状詳記区分コードCode(arg: string): 症状詳記区分コードCode {
  if (is症状詳記区分コードCode(arg)) {
    return arg;
  } else {
    throw new Error("Invalid 症状詳記区分コードCode: " + arg);
  }
}

export type ShotokuKubunCode =
  "ア"
  | "イ"
  | "ウ"
  | "エ"
  | "オ"
  | "オ（境）"
  | "現役並みⅢ"
  | "現役並みⅡ"
  | "現役並みⅠ"
  | "一般"
  | "低所得Ⅱ"
  | "低所得Ⅰ"
  | "低所得Ⅰ（老福）"
  | "低所得Ⅰ（境）"
  | "一般Ⅱ"
  | "一般Ⅰ"
  ;




