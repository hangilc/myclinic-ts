let hotlineNameRepMap: Record<string, string> = {
  "practice": "診療",
  "reception": "受付"
}

export function hotlineNameRep(code: string): string {
  const rep = hotlineNameRepMap[code];
  return typeof rep === "string" ? rep : code;
}

let regularsMap: Record<string, string[]> = {
  "practice": [
    "おはようございます。",
    "診察室におねがいします。",
    "処方箋おねがいします。",
    "検査伝票おねがいします。",
  ],
  "reception": [
    "おはようございます。",
    "退出します。",
    "戻りました。",
    "検温中です。",
    "体温 {} 度でした。",
    "胃腸の調子が悪いそうです。",
    "相談です。",
    "セットできました。",
    "面会の方がいらしてます。",
  ]
}

export function getRegulars(code: string): string[] {
  return regularsMap[code] || [];
}

