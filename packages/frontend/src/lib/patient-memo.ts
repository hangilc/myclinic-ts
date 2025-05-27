export interface PatientMemo {
  rezeptName?: string;
  onshiName?: string;
  mainDisease?: string;
  email?: string;
}

export class PatientMemoWrapper {
  memo: PatientMemo;

  constructor(memo: string | undefined) {
    if( !memo ){
      this.memo = {};
    } else {
      this.memo = JSON.parse(memo);
    }
  }

  serialize(): string | undefined {
    if( Object.keys(this.memo).length === 0 ){
      return undefined;
    } else {
      return JSON.stringify(this.memo);
    }
  }

  getRezeptName(): string | undefined {
    return this.memo.rezeptName;
  }

  getOnshiName(): string | undefined {
    return this.memo.onshiName;
  }

  getMainDisease(): string | undefined {
    return this.memo.mainDisease;
  }

  getEmail(): string | undefined {
    return this.memo.email;
  }

  setRezeptName(value: string | undefined) {
    this.memo.rezeptName = value;
  }

  setOnshiName(value: string | undefined) {
    this.memo.onshiName = value;
  }

  setMainDisease(value: string | undefined) {
    this.memo.mainDisease = value;
  }

  setEmail(value: string | undefined) {
    this.memo.email = value;
  }
}


