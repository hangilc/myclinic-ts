import {
  isLimitApplicationCertificateClassificationCode,
  isLimitApplicationCertificateClassificationFlagCode, 
  LimitApplicationCertificateClassification, 
  LimitApplicationCertificateClassificationFlag, 
  type LimitApplicationCertificateClassificationFlagLabel, 
  type LimitApplicationCertificateClassificationLabel
} from "./codes";
import { castOptStringProp } from "./cast";
import { onshiDateOptToSqlDateOpt } from "./util";

interface LimitApplicationCertificateRelatedInfoInterface {
  LimitApplicationCertificateClassification: string | undefined;
  LimitApplicationCertificateClassificationFlag: string | undefined;
  LimitApplicationCertificateDate: string | undefined;
  LimitApplicationCertificateValidStartDate: string | undefined;
  LimitApplicationCertificateValidEndDate: string | undefined;
  LimitApplicationCertificateLongTermDate: string | undefined;
}

export class LimitApplicationCertificateRelatedInfo {
  orig: LimitApplicationCertificateRelatedInfoInterface;

  constructor(arg: LimitApplicationCertificateRelatedInfoInterface) {
    this.orig = arg;
  }

  // 証の種類
  get limitApplicationCertificateClassification(): LimitApplicationCertificateClassificationLabel | undefined {
    const k: string | undefined = this.orig.LimitApplicationCertificateClassification;
    if (k == undefined) {
      return undefined;
    } else if (isLimitApplicationCertificateClassificationCode(k)) {
      return LimitApplicationCertificateClassification[k];
    } else {
      throw new Error("Invalid LimitApplicationCertificateClassification: " + k);
    }
  }

  // 自己負担限度額を算出する際に適用する分類
  get limitApplicationCertificateClassificationFlag():
    LimitApplicationCertificateClassificationFlagLabel | undefined {
    const k: string | undefined = this.orig.LimitApplicationCertificateClassificationFlag;
    if (k == undefined) {
      return undefined;
    } else if (isLimitApplicationCertificateClassificationFlagCode(k)) {
      return LimitApplicationCertificateClassificationFlag[k];
    } else {
      throw new Error("Invalid LimitApplicationCertificateClassificationFlag: " + k);
    }
  }

  get kind(): LimitApplicationCertificateClassificationFlagLabel | undefined {
    return this.limitApplicationCertificateClassificationFlag;
  }

  // 限度額適用認定証が交付された日
  get limitApplicationCertificateDate(): string | undefined {
    return onshiDateOptToSqlDateOpt(this.orig.LimitApplicationCertificateDate);
  }

  // 限度額適用認定証が有効である最初の日
  get limitApplicationCertificateValidStartDate(): string | undefined {
    return onshiDateOptToSqlDateOpt(this.orig.LimitApplicationCertificateValidStartDate);
  }

  // 限度額適用認定証が有効である最後の日
  get limitApplicationCertificateValidEndDate(): string | undefined {
    return onshiDateOptToSqlDateOpt(this.orig.LimitApplicationCertificateValidEndDate);
  }

  // 過去12か月で区分Ⅱの交付を受けていた期間の入院日数が90日を超えた場
  // 合に、申請日の翌月1日が設定される。
  get limitApplicationCertificateLongTermDate(): string | undefined {
    return onshiDateOptToSqlDateOpt(this.orig.LimitApplicationCertificateLongTermDate);
  }

  toJsonObject(): object {
    return this.orig;
  }

  static cast(arg: any): LimitApplicationCertificateRelatedInfo {
    return new LimitApplicationCertificateRelatedInfo({
      LimitApplicationCertificateClassification: castOptStringProp(arg, "LimitApplicationCertificateClassification"),
      LimitApplicationCertificateClassificationFlag: castOptStringProp(arg, "LimitApplicationCertificateClassificationFlag"),
      LimitApplicationCertificateDate: castOptStringProp(arg, "LimitApplicationCertificateDate"),
      LimitApplicationCertificateValidStartDate: castOptStringProp(arg, "LimitApplicationCertificateValidStartDate"),
      LimitApplicationCertificateValidEndDate: castOptStringProp(arg, "LimitApplicationCertificateValidEndDate"),
      LimitApplicationCertificateLongTermDate: castOptStringProp(arg, "LimitApplicationCertificateLongTermDate"),
    });
  }
}


