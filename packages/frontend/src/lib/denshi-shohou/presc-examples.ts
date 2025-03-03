import type { RP剤情報 } from "./presc-info";

export const presc_example_1: RP剤情報[] = [
  {
    剤形レコード: { 剤形区分: "内服", 調剤数量: 5 },
    用法レコード: {
      用法コード: "1013044400000000",
      用法名称: "１日３回朝昼夕食後　服用",
    },
    薬品情報グループ: [
      {
        薬品レコード: {
          情報区分: "医薬品",
          薬品コード種別: "レセプト電算処理システム用コード",
          薬品コード: "620000033",
          薬品名称: "カロナール錠３００　３００ｍｇ",
          分量: "3",
          力価フラグ: "薬価単位",
          単位名: "錠",
        },
      },
    ],
  },
];

export const presc_example_2: RP剤情報[] = [
  {
    剤形レコード: {
      剤形区分: "頓服",
      調剤数量: 10,
    },
    用法レコード: {
      用法コード: "1050120000000000",
      用法名称: "頭痛時　服用",
    },
    薬品情報グループ: [
      {
        薬品レコード: {
          情報区分: "医薬品",
          薬品コード種別: "レセプト電算処理システム用コード",
          薬品コード: "620000033",
          薬品名称: "カロナール錠３００　３００ｍｇ",
          分量: "1",
          力価フラグ: "薬価単位",
          単位名: "錠",
        },
      },
    ],
  },
];

export const presc_example_3: RP剤情報[] = [
  {
    剤形レコード: {
      剤形区分: "外用",
      調剤数量: 1,
    },
    用法レコード: {
      用法コード: "1371N00000000000",
      用法名称: "１日１～数回　口腔内塗布",
    },
    薬品情報グループ: [
      {
        薬品レコード: {
          情報区分: "医薬品",
          薬品コード種別: "レセプト電算処理システム用コード",
          薬品コード: "620509101",
          薬品名称: "オルテクサー口腔用軟膏０．１％",
          分量: "5",
          力価フラグ: "薬価単位",
          単位名: "ｇ",
        },
      },
    ],
  },
];

export const presc_example_4: RP剤情報[] = [
  {
    剤形レコード: {
      剤形区分: "外用",
      調剤数量: 1,
    },
    用法レコード: {
      用法コード: "0X0XXXXXXXXX0000",
      用法名称: "１日２回　患部に貼付",
    },
    薬品情報グループ: [
      {
        薬品レコード: {
          情報区分: "医薬品",
          薬品コード種別: "レセプト電算処理システム用コード",
          薬品コード: "620007812",
          薬品名称: "ロキソニンテープ５０ｍｇ　７ｃｍ×１０ｃｍ",
          分量: "63",
          力価フラグ: "薬価単位",
          単位名: "枚",
        },
      },
    ],
  },
];

export const presc_example_5: RP剤情報[] = [
  {
    剤形レコード: {
      剤形区分: "外用",
      調剤数量: 1,
    },
    用法レコード: {
      用法コード: "2L62090900000000",
      用法名称: "１日２回朝夕　吸入",
    },
    薬品情報グループ: [
      {
        薬品レコード: {
          情報区分: "医薬品",
          薬品コード種別: "レセプト電算処理システム用コード",
          薬品コード: "621781501",
          薬品名称: "アドエア２５０ディスカス２８吸入用　２８ブリスター",
          分量: "1",
          力価フラグ: "薬価単位",
          単位名: "キット",
        },
      },
    ],
  },
];

export const presc_example_6: RP剤情報[] = [
  {
    剤形レコード: {
      剤形区分: "頓服",
      調剤数量: 6,
    },
    用法レコード: {
      用法コード: "2R50410000000000",
      用法名称: "便秘時　肛門挿入",
    },
    薬品情報グループ: [
      {
        薬品レコード: {
          情報区分: "医薬品",
          薬品コード種別: "レセプト電算処理システム用コード",
          薬品コード: "662350104",
          薬品名称: "新レシカルボン坐剤",
          分量: "1",
          力価フラグ: "薬価単位",
          単位名: "個",
        },
      },
    ],
  },
];

export const presc_example_7: RP剤情報[] = [
  {
    剤形レコード: {
      剤形区分: "頓服",
      調剤数量: 6,
    },
    用法レコード: {
      用法コード: "1050120000000000",
      用法名称: "頭痛時　服用",
    },
    用法補足レコード: [
      {
        用法補足区分: "用法の続き",
        用法補足情報: "（１日３回まで）",
      },
    ],
    薬品情報グループ: [
      {
        薬品レコード: {
          情報区分: "医薬品",
          薬品コード種別: "レセプト電算処理システム用コード",
          薬品コード: "620098801",
          薬品名称: "ロキソニン錠６０ｍｇ",
          分量: "1",
          力価フラグ: "薬価単位",
          単位名: "錠",
        },
      },
    ],
  },
];

export const presc_example_8: RP剤情報[] = [
  {
    剤形レコード: {
      剤形区分: "内服",
      調剤数量: 5,
    },
    用法レコード: {
      用法コード: "1013044400000000",
      用法名称: "１日３回朝昼夕食後　服用",
    },
    薬品情報グループ: [
      {
        薬品レコード: {
          情報区分: "医薬品",
          薬品コード種別: "レセプト電算処理システム用コード",
          薬品コード: "612450118",
          薬品名称: "プレドニン錠５ｍｇ",
          分量: "4",
          力価フラグ: "薬価単位",
          単位名: "錠",
        },
        不均等レコード: {
          不均等１回目服用量: "2",
          不均等２回目服用量: "1",
          不均等３回目服用量: "1",
        },
      },
    ],
  },
];

// eexample result
// let result = {
//   XmlMsg: {
//     MessageHeader: { SegmentOfResult: "1", CharacterCodeIdentifier: "0" },
//     MessageBody: {
//       ProcessingResultStatus: "1",
//       PrescriptionId: "6b5c2c06-884f-4fe8-bc2e-797c97896976",
//       AccessCode: "317676",
//       VerifyResultList: [
//         {
//           Status: "0",
//           Message: "署名検証が成功しました",
//           SignId: "PrescriptionSign",
//         },
//       ],
//       GenerateSignResult: {
//         GenerateSignStatus: "0",
//         GenerateSignMessage: "署名生成処理が成功しました",
//       },
//     },
//   },
// };
