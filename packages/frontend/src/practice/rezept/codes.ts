export const 診査支払い機関コード = {
  "社会保険診療報酬支払基金": 1,
  "国民健康保険団体連合会": 2,
};

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
    map[k] = i+1;
  });
  return map;
}

export const RezeptShubetuCodeOffset: Record<string, number> = {
  "本人": 2,
  "未就学者": 4,
  "家族": 6,
  "高齢需給一般": 8,
  "高齢需給７割": 0,
}

export const RezeptShubetsuCodeBase: Record<string, number> = {
  "保険単独": 1110,
}

