class Record {
  recordNumber: number;
  code: string;

  constructor(recordNumber: number, code: string) {
    this.recordNumber = recordNumber;
    this.code = code;
  }

  render(): string {
    return `${this.recordNumber},${this.code}`;
  }
}

export class DenshiShohou {
  records: Record[];

  constructor() {
    this.records = [];
  }

  addRecord(recordNumber: number, values: string[]) {
    this.records.push(new Record(recordNumber, values.join(",")));
  }

  // 医療機関情報グループ
  医療機関レコード(医療機関コード種別: 点数表, 医療機関コード: string, 医療機関都道府県コード: 都道府県, 医療機関名称: string) {
    this.addRecord(1, [
      点数表Map[医療機関コード種別],
      医療機関コード,
      都道府県Map[医療機関都道府県コード],
      医療機関名称
    ]);
  }

  医療機関所在地レコード(医療機関郵便番号: string | undefined, 医療機関所在地: string) {
    this.addRecord(2, [
      医療機関郵便番号 || "",
      医療機関所在地
    ]);
  }

  医療機関電話レコード(医療機関電話番号: string, ＦＡＸ番号: string | undefined, その他連絡先: string | undefined) {
    this.addRecord(3, [
      医療機関電話番号,
      ＦＡＸ番号 || "",
      その他連絡先 || "",
    ]);
  }

  医療機関診療科レコード(診療科コード種別: 診療科コード種別, 診療科コード: 診療科コード | undefined, 診療科名: string) {
    this.addRecord(4, [
      診療科コード種別Map[診療科コード種別],
      診療科コード !== undefined ? 診療科コードMap[診療科コード] : "",
      診療科名,
    ]);
  }

  // 医師情報グループ
  医師レコード(医師コード: string | undefined, 医師カナ氏名: string | undefined, 医師漢字氏名: string) {
    this.addRecord(5, [
      医師コード || "",
      医師カナ氏名 || "",
      医師漢字氏名
    ]);
  }

  // 患者情報グループ
  患者氏名レコード(患者コード: string | undefined, 患者漢字氏名: string, 患者カナ氏名: string) {
    this.addRecord(11, [
      患者コード ?? "",
      患者漢字氏名,
      患者カナ氏名,
    ]);
  }

  患者性別レコード(患者性別: 性別コード) {
    this.addRecord(12, [
      性別コードMap[患者性別],
    ]);
  }
  患者生年月日レコード(患者生年月日: string) {
    this.addRecord(13, [
      患者生年月日,
    ]);
  }

  患者一部負担区分レコード(一部負担金区分: 保険一部負担金区分コード) {
    this.addRecord(14, [
      保険一部負担金区分コードMap[一部負担金区分],
    ]);
  }

  保険種別レコード(保険種別: 保険種別コード) {
    this.addRecord(21, [
      保険種別コードMap[保険種別],
    ]);
  }

  保険者番号レコード(保険者番号: string) { // 保険者番号 -- 6 or 8 digits
    this.addRecord(22, [
      保険者番号,
    ]);
  }

  記号番号レコード(被保険者証記号: string | undefined, 被保険者証番号: string, 被保険者被扶養者: 被保険者等種別,
    被保険者証枝番: string | undefined // 2 digits
  ) {
    this.addRecord(23, [
      被保険者証記号 || "",
      被保険者証番号,
      被保険者等種別Map[被保険者被扶養者],
      被保険者証枝番 || "",
    ]);
  }

  負担給付率レコード(患者負担率: string, // 3 digits, e.g., "030"
    保険給付率: string // 3 digits, e.g., "070",
  ) {
    this.addRecord(24, [
      患者負担率,
      保険給付率,
    ]);
  }

  職務上の事由レコード(職務上の事由: 職務上の事由コード) {
    this.addRecord(25, [
      職務上の事由コードMap[職務上の事由],
    ]);
  }

  第一公費レコード(第一公費負担者番号: string, 第一公費受給者番号: string | undefined) {
    this.addRecord(27, [
      第一公費負担者番号,
      第一公費受給者番号 || "",
    ]);
  }

  第二公費レコード(第二公費負担者番号: string, 第二公費受給者番号: string | undefined) {
    this.addRecord(28, [
      第二公費負担者番号,
      第二公費受給者番号 || "",
    ]);
  }

  第三公費レコード(第三公費負担者番号: string, 第三公費受給者番号: string | undefined) {
    this.addRecord(29, [
      第三公費負担者番号,
      第三公費受給者番号 || "",
    ]);
  }

  特殊公費レコード(特殊公費負担者番号: string, 特殊公費受給者番号: string | undefined) {
    this.addRecord(30, [
      特殊公費負担者番号,
      特殊公費受給者番号 || "",
    ]);
  }

  レセプト種別レコード(レセプト種別コード: string) {
    this.addRecord(31, [
      レセプト種別コード,
    ]);
  }

  // 処方箋管理情報グループ
  処方箋交付年月日レコード(処方箋交付年月日: string) {
    this.addRecord(51, [
      処方箋交付年月日,
    ]);
  }

  使用期限年月日レコード(使用期限年月日: string) {
    this.addRecord(52, [
      使用期限年月日,
    ]);
  }

  麻薬施用レコード(麻薬施用者免許番号: string, 麻薬施用患者住所: string, 麻薬施用患者電話番号: string) {
    this.addRecord(60, [
      麻薬施用者免許番号,
      麻薬施用患者住所,
      麻薬施用患者電話番号,
    ]);
  }

  残薬確認欄レコード(残薬確認対応フラグ: 残薬確認対応フラグ) {
    this.addRecord(62, [
      残薬確認対応フラグMap[残薬確認対応フラグ],
    ]);
  }

  備考レコード(備考連番: number, 備考種別: 備考種別 | undefined, 備考: string) {
    this.addRecord(81, [
      備考連番.toString(),
      備考種別 !== undefined ? 備考種別Map[備考種別] : "",
      備考,
    ]);
  }

  処方箋番号レコード(引換番号: string) {
    this.addRecord(82, [
      "1",
      引換番号,
    ]);
  }

  // RP 剤情報グループ
  剤形レコード(RP番号: number, 剤形区分: 剤形区分, 剤形名称: string | undefined, 調剤数量: number) {
    this.addRecord(101, [
      RP番号.toString(),
      剤形区分Map[剤形区分],
      剤形名称 ?? "",
      調剤数量.toString(),
    ]);
  }

  用法レコード(RP番号: number, 用法コード: string | undefined, 用法名称: string, 用法１日回数: number | undefined) {
    this.addRecord(111, [
      RP番号.toString(),
      "3", // 用法コード種別 = 電子処方箋用法マスタ
      用法コード ?? "0X0XXXXXXXXX0000",
      用法名称,
      用法１日回数 !== undefined ? 用法１日回数.toString() : "",
    ]);
  }

  用法補足レコード(RP番号: number, RP補足連番: number, 用法補足区分: 用法補足区分 | undefined,
    用法補足情報: string, 補足用法コード: string | undefined, 部位コード: string | undefined,
  ) {
    this.addRecord(181, [
      RP番号.toString(),
      RP補足連番.toString(),
      用法補足区分 !== undefined ? 用法補足区分Map[用法補足区分] : "",
      用法補足情報,
      補足用法コード ?? "",
      部位コード ?? "",
    ]);
  }

  薬品レコード(RP番号: number, RP内連番: number, 情報区分: 情報区分, 薬品コード種別: 薬品コード種別,
    薬品コード: string, 薬品名称: string, 分量: string, 力価フラグ: 力価フラグ, 単位名: string,
  ) {
    this.addRecord(201, [
      RP番号.toString(),
      RP内連番.toString(),
      情報区分Map[情報区分],
      薬品コード種別Map[薬品コード種別],
      薬品コード,
      薬品名称,
      分量,
      力価フラグMap[力価フラグ],
      単位名,
    ]);
  }

  単位変換レコード(RP番号: number, RP内連番: number, 単位変換係数: string) {
    this.addRecord(211, [
      RP番号.toString(),
      RP内連番.toString(),
      単位変換係数,
    ]);
  }

  不均等レコード(RP番号: number, RP内連番: number, 不均等１回目服用量: string, 不均等２回目服用量: string,
    不均等３回目服用量: string | undefined, 不均等４回目服用量: string | undefined,
    不均等５回目服用量: string | undefined,
  ) {
    this.addRecord(221, [
      RP番号.toString(),
      RP内連番.toString(),
      不均等１回目服用量,
      不均等２回目服用量,
      不均等３回目服用量 ?? "",
      不均等４回目服用量 ?? "",
      不均等５回目服用量 ?? "",
      "",
      "",
      "",
      "",
      "",
    ]);
  }

  負担区分レコード(RP番号: number, RP内連番: number, 第一公費負担区分: boolean | undefined,
    第二公費負担区分: boolean | undefined,
    第三公費負担区分: boolean | undefined, 特殊公費負担区分: boolean | undefined,
  ) {
    this.addRecord(231, [
      RP番号.toString(),
      RP内連番.toString(),
      第一公費負担区分 ? "1" : "",
      第二公費負担区分 ? "1" : "",
      第三公費負担区分 ? "1" : "",
      特殊公費負担区分 ? "1" : "",
    ]);
  }

  薬品１回服用量レコード(RP番号: number, RP内連番: number, 薬剤１回服用量: string,
    薬剤１日服用回数: number | undefined,
  ) {
    this.addRecord(241, [
      RP番号.toString(),
      RP内連番.toString(),
      薬剤１回服用量,
      薬剤１日服用回数 !== undefined ? 薬剤１日服用回数.toString() : "",
    ]);
  }

  薬品補足レコード(RP番号: number, RP内連番: number, 薬品補足連番: number,
    薬品補足区分: 薬品補足区分 | undefined, 薬品補足情報: string,
  ) {
    this.addRecord(281, [
      RP番号.toString(),
      RP内連番.toString(),
      薬品補足連番.toString(),
      薬品補足区分 !== undefined ? 薬品補足区分Map[薬品補足区分] : "",
      薬品補足情報,
      "",
    ]);
  }

  提供診療情報レコード(提供診療情報連番: number, 薬品名称: string | undefined, コメント: string) {
    this.addRecord(301, [
      提供診療情報連番.toString(),
      薬品名称 ?? "",
      コメント,
    ]);
  }

  検査値データ等レコード(検査値データ等連番: number, 検査値データ等: string) {
    this.addRecord(302, [
      検査値データ等連番.toString(),
      検査値データ等,
    ]);
  }


  output(): string {
    const recs: Record[] = [...this.records];
    return ["SJ1", ...recs.map(r => r.render())].map(code => `${code}\n`).join("");
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

const 診療科コード種別Map = {
  "コードなし": "1",
  "診療科コード": "2",
} as const;

export type 診療科コード種別 = keyof typeof 診療科コード種別Map;

export const 診療科コードMap = {
  内科: "01",
  精神科: "02",
  小児科: "09",
  外科: "10",
  皮膚科: "19",
  ひ尿器科: "20",
  産婦人科: "23",
  眼科: "26",
  耳鼻いんこう科: "27",
  放射線科: "30",
  麻酔科: "31",
  アレルギー科: "34",
  リウマチ科: "35",
  リハビリテーション科: "36",
  病理診断科: "37",
  臨床検査科: "38",
  救急科: "39",
  神経科: "03",
  神経内科: "04",
  呼吸器科: "05",
  消化器科: "06",
  胃腸科: "07",
  循環器科: "08",
  整形外科: "11",
  形成外科: "12",
  美容外科: "13",
  脳神経外科: "14",
  呼吸器外科: "15",
  心臓血管外科: "16",
  小児外科: "17",
  皮膚ひ尿器科: "18",
  性病科: "21",
  肛門科: "22",
  産科: "24",
  婦人科: "25",
  気管食道科: "28",
  心療内科: "33",
} as const;

export type 診療科コード = keyof typeof 診療科コードMap;

const 性別コードMap = {
  男: "1",
  女: "2",
} as const;

export type 性別コード = keyof typeof 性別コードMap;

const 保険一部負担金区分コードMap = {
  高齢者一般: "1",
  高齢者７割: "2",
  "６歳未満": "3",
  高齢者８割: "5",
} as const;

export type 保険一部負担金区分コード = keyof typeof 保険一部負担金区分コードMap;

const 保険種別コードMap = {
  医保: "1",
  国保: "2",
  後期高齢者: "7",
} as const;

export type 保険種別コード = keyof typeof 保険種別コードMap;

const 被保険者等種別Map = {
  被保険者: "1",
  被扶養者: "2",
} as const;

export type 被保険者等種別 = keyof typeof 被保険者等種別Map;

const 職務上の事由コードMap = {
  職務上: "1",
  下船後3ヶ月以内: "2",
  通勤災害: "3",
} as const;

export type 職務上の事由コード = keyof typeof 職務上の事由コードMap;

const 残薬確認対応フラグMap = {
  保険医療機関へ疑義照会した上で調剤f: "1",
  保険医療機関へ情報提供: "2",
} as const;

export type 残薬確認対応フラグ = keyof typeof 残薬確認対応フラグMap;

export const 備考種別Map = {
  "一包化": "1",
  粉砕: "2",
} as const;

export type 備考種別 = keyof typeof 備考種別Map;

const 剤形区分Map = {
  内服: "1",
  頓服: "2",
  外用: "3",
  内服滴剤: "4",
  注射: "5",
  医療材料: "6",
  不明: "9",
} as const;

export type 剤形区分 = keyof typeof 剤形区分Map;

const 用法補足区分Map = {
  漸減: "1",
  "一包化": "2",
  隔日: "3",
  粉砕: "4",
  用法の続き: "5",
  部位: "6",
  "１回使用量": "7",
  JAMI補足用法: "8",
  JAMI部位: "9",
} as const;

export type 用法補足区分 = keyof typeof 用法補足区分Map;

const 情報区分Map = {
  "医薬品": "1",
  "医療材料": "2",
} as const;

export type 情報区分 = keyof typeof 情報区分Map;

const 力価フラグMap = {
  "薬価単位": "1",
  "力価単位": "2",
} as const;

export type 力価フラグ = keyof typeof 力価フラグMap;

const 薬品コード種別Map = {
  レセプト電算処理システム用コード: "2",
  YJコード: "4",
  "一般名コード": "7",
} as const;

export type 薬品コード種別 = keyof typeof 薬品コード種別Map;

export const 薬品補足区分Keys = [
  "一包化",
  "粉砕",
  "後発品変更不可",
  "剤形変更不可",
  "含量規格変更不可",
  "剤形変更不可及び含量規格変更不可",
  "JAMI補足用法",
] as const;

export const 薬品補足区分Map: { [key in typeof 薬品補足区分Keys[number]]: string } = {
  "一包化": "1",
  粉砕: "2",
  後発品変更不可: "3",
  剤形変更不可: "4",
  含量規格変更不可: "5",
  剤形変更不可及び含量規格変更不可: "6",
  JAMI補足用法: "7",
} as const;

export type 薬品補足区分 = typeof 薬品補足区分Keys[number];

export function tryCastTo薬品補足区分(key: string): 薬品補足区分 | undefined {
  return 薬品補足区分Keys.find(k => k == key);
}

const 頻用用法コードMap = {
  "１日１回起床時　服用": "1011000090000000",
  "１日１回朝食前　服用": "1011000100000000",
  "１日１回朝食後　服用": "1011000400000000",
  "１日１回昼食後　服用": "1011004000000000",
  "１日１回夕食後　服用": "1011040000000000",
  "１日１回就寝前　服用": "1011100000000000",
  "１日２回朝夕食後　服用": "1012040400000000",
  "１日３回朝昼夕食後　服用": "1013044400000000",
  "疼痛時　服用": "1050110000000000",
} as const;

export type 頻用用法コード = keyof typeof 頻用用法コードMap;
