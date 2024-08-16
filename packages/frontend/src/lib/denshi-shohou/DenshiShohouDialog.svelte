<script lang="ts">
  import type { HokenInfo, Kouhi, Patient, Visit } from "myclinic-model";
  import { getClinicInfo } from "../cache";
  import Dialog from "../Dialog.svelte";
  import {
    castTo都道府県コード,
    type 保険一部負担金区分コード,
    type 保険種別コード,
    type 被保険者等種別,
  } from "./denshi-shohou";
  import {
    createPrescInfo,
    type PrescInfoData,
    type RP剤情報,
    type 公費レコード,
    type 薬品情報,
  } from "./presc-info";
  import ShohouForm from "./ShohouForm.svelte";
  import { convertZenkakuHiraganaToHankakuKatakana } from "../zenkaku";
  import { DateWrapper } from "myclinic-util";
  import { isUnder6 } from "../futan-wari";
  import { isKokuho } from "myclinic-rezept/helper";
  import {
    RezeptShubetsuCodeBase,
    RezeptShubetuCodeOffset,
  } from "myclinic-rezept/codes";
  import NewDrugDialog from "./NewDrugDialog.svelte";
  import { renderDrug, renderPresc } from "./presc-renderer";

  export let destroy: () => void;
  export let patient: Patient;
  export let hokenInfo: HokenInfo;
  export let visit: Visit;
  export let at: string;
  export let onEnter: (data: PrescInfoData) => void;
  let drugIndex = 1;
  let drugs: {
    index: number;
    drug: RP剤情報;
    render: {
      usage: string;
      times: string;
      drugs: string[];
    };
  }[] = [];

  function doCancel() {
    destroy();
  }

  function resolve保険一部負担金区分(
    hoken: HokenInfo,
    patient: Patient,
    visit: Visit
  ): 保険一部負担金区分コード | undefined {
    if (hoken.koukikourei) {
      switch (hoken.koukikourei.futanWari) {
        case 3:
          return "高齢者７割";
        case 2:
          return "高齢者８割";
        case 1:
          return "高齢者一般";
        default: {
          throw new Error(
            `Invalid Koukikourei FutanWari: ${hoken.koukikourei.futanWari}.`
          );
        }
      }
    } else if (hoken.shahokokuho) {
      switch (hoken.shahokokuho.koureiStore) {
        case 3:
          return "高齢者７割";
        case 2:
          return "高齢者８割";
        case 1:
          return "高齢者一般";
        default: {
          return undefined;
        }
      }
    } else if (isUnder6(patient.birthday, visit.visitedAt)) {
      return "６歳未満";
    }
    throw new Error("No hoken");
  }

  function resolve保険種別(hoken: HokenInfo): 保険種別コード {
    if (hoken.koukikourei) {
      return "後期高齢者";
    } else if (hoken.shahokokuho) {
      if (isKokuho(hoken.shahokokuho.hokenshaBangou)) {
        return "国保";
      } else {
        return "医保";
      }
    } else {
      throw new Error("No hoken");
    }
  }

  function resolve保険者番号(hoken: HokenInfo): string {
    if (hoken.koukikourei) {
      return hoken.koukikourei.hokenshaBangou;
    } else if (hoken.shahokokuho) {
      const bangou = hoken.shahokokuho.hokenshaBangou.toString();
      if (bangou.length < 6) {
        let pre = "0".repeat(6 - bangou.length);
        return `${pre}${bangou}`;
      } else if (bangou.length < 8) {
        let pre = "0".repeat(8 - bangou.length);
        return `${pre}${bangou}`;
      } else {
        return bangou;
      }
    } else {
      throw new Error(`No hoken`);
    }
  }

  function resolve被保険者証記号(hoken: HokenInfo): string | undefined {
    if (hoken.shahokokuho) {
      return hoken.shahokokuho.hihokenshaKigou;
    } else {
      return undefined;
    }
  }

  function resolve被保険者証番号(hoken: HokenInfo): string {
    if (hoken.shahokokuho) {
      return hoken.shahokokuho.hihokenshaBangou;
    } else if (hoken.koukikourei) {
      return hoken.koukikourei.hihokenshaBangou;
    } else {
      throw new Error(`No hoken`);
    }
  }

  function resolve被保険者被扶養者(hoken: HokenInfo): 被保険者等種別 {
    if (hoken.shahokokuho) {
      return hoken.shahokokuho.honninStore !== 0 ? "被保険者" : "被扶養者";
    } else if (hoken.koukikourei) {
      return "被保険者";
    } else {
      throw new Error(`No hoken`);
    }
  }

  function resolve被保険者証枝番(hoken: HokenInfo): string | undefined {
    if (hoken.shahokokuho) {
      return hoken.shahokokuho.edaban !== ""
        ? hoken.shahokokuho.edaban
        : undefined;
    } else if (hoken.koukikourei) {
      return undefined;
    } else {
      throw new Error(`No hoken`);
    }
  }

  function resolve公費レコード(
    kouhi: Kouhi | undefined
  ): 公費レコード | undefined {
    if (kouhi) {
      return {
        公費負担者番号: kouhi.futansha.toString(),
        公費受給者番号: kouhi.jukyuusha.toString(),
      };
    } else {
      return undefined;
    }
  }

  function resolveレセプト種別コード(hoken: HokenInfo): string {
    function f(): number {
      let shahokokuho = hoken.shahokokuho;
      let koukikourei = hoken.koukikourei;
      let kouhiListLength = hoken.kouhiList.length;
      if (koukikourei) {
        let base = RezeptShubetsuCodeBase.後期高齢単独 + kouhiListLength * 10;
        let offset: number;
        if (koukikourei.futanWari === 3) {
          offset = RezeptShubetuCodeOffset.高齢受給７割;
        } else {
          offset = RezeptShubetuCodeOffset.高齢受給一般;
        }
        return base + offset;
      } else if (shahokokuho) {
        let base = RezeptShubetsuCodeBase.社保国保単独 + kouhiListLength * 10;
        let offset: number;
        if (shahokokuho.koureiStore > 0) {
          if (shahokokuho.koureiStore === 3) {
            offset = RezeptShubetuCodeOffset.高齢受給７割;
          } else {
            offset = RezeptShubetuCodeOffset.高齢受給一般;
          }
        } else {
          if (shahokokuho.honninStore !== 0) {
            offset = RezeptShubetuCodeOffset.本人;
          } else {
            offset = RezeptShubetuCodeOffset.家族;
          }
        }
        return base + offset;
      } else {
        return RezeptShubetsuCodeBase.公費単独 + kouhiListLength * 10;
      }
    }
    let code = f().toString();
    if (code.length !== 4) {
      throw new Error(`Invalid レセプト種別コード: ${code}`);
    }
    return code;
  }

  async function doEnter() {
    function toKana(s: string): string {
      return convertZenkakuHiraganaToHankakuKatakana(s);
    }
    const clinicInfo = await getClinicInfo();
    let kikancode = clinicInfo.kikancode;
    const postalCode = clinicInfo.postalCode.replace(/^〒/, "");
    const patientNameKana = `${toKana(patient.lastNameYomi)} ${toKana(patient.firstNameYomi)}`;
    let 第一公費レコード = resolve公費レコード(hokenInfo.kouhiList[0]);
    let 第二公費レコード = resolve公費レコード(hokenInfo.kouhiList[1]);
    let 第三公費レコード = resolve公費レコード(hokenInfo.kouhiList[2]);
    let shohou: PrescInfoData = {
      医療機関コード種別: "医科",
      医療機関コード: kikancode,
      医療機関都道府県コード: castTo都道府県コード(clinicInfo.todoufukencode),
      医療機関名称: clinicInfo.name,
      医療機関郵便番号: postalCode,
      医療機関所在地: clinicInfo.address,
      医療機関電話番号: clinicInfo.tel,
      ＦＡＸ番号: clinicInfo.fax,
      診療科レコード: {
        診療科コード種別: "診療科コード",
        診療科コード: "内科",
      },
      医師漢字氏名: `${clinicInfo.doctorLastName}　${clinicInfo.doctorFirstName}`,
      患者コード: patient.patientId.toString(),
      患者漢字氏名: `${patient.lastName}　${patient.firstName}`, // 性と名は全角スペースで区切る。
      患者カナ氏名: patientNameKana, // 半角カナで記録する。姓と名は半角スペースで区切る。
      患者性別: patient.sex === "M" ? "男" : "女",
      患者生年月日: DateWrapper.from(patient.birthday)
        .asSqlDate()
        .replaceAll(/-/g, ""),
      保険一部負担金区分: resolve保険一部負担金区分(hokenInfo, patient, visit),
      保険種別: resolve保険種別(hokenInfo),
      保険者番号: resolve保険者番号(hokenInfo),
      被保険者証記号: resolve被保険者証記号(hokenInfo),
      被保険者証番号: resolve被保険者証番号(hokenInfo),
      被保険者被扶養者: resolve被保険者被扶養者(hokenInfo),
      被保険者証枝番: resolve被保険者証枝番(hokenInfo),
      第一公費レコード,
      第二公費レコード,
      第三公費レコード,
      特殊公費レコード: undefined,
      レセプト種別コード: resolveレセプト種別コード(hokenInfo),
      処方箋交付年月日: DateWrapper.from(visit.visitedAt)
        .asSqlDate()
        .replaceAll(/-/g, ""),
      RP剤情報グループ: drugs.map(drug => drug.drug),
    };
    onEnter(shohou);
  }

  function doAdd() {
    const form: NewDrugDialog = new NewDrugDialog({
      target: document.body,
      props: {
        destroy: () => form.$destroy(),
        at,
        onEnter: (drug) => {
          console.log("drug", drug);
          let render = renderDrug(drug);
          drugs.push({ index: drugIndex, drug, render });
          drugIndex += 1;
          drugs = drugs;
        },
      },
    });
  }

  function doFreq() {
    
  }
</script>

<Dialog title="新規処方" {destroy}>
  <div class="top">
    <div class="drug-render">
      {#each drugs as drug, i (drug.index)}
        <div>{i + 1})</div>
        <div>
          {#each drug.render.drugs as d}
            <div>{d}</div>
          {/each}
          <div>{drug.render.usage} {drug.render.times}</div>
        </div>
      {/each}
    </div>
    <div>
      <button on:click={doFreq}>登録薬剤</button>
      <button on:click={doAdd}>手動追以下</button>
    </div>
    <div class="commands">
      <button on:click={doEnter}>入力</button>
      <button on:click={doCancel}>キャンセル</button>
    </div>
  </div>
</Dialog>

<style>
  .top {
    width: 360px;
  }
  .drug-render {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px;
  }
  .commands {
    text-align: right;
    margin-top: 10px;
  }
</style>
