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
  } from "./presc-info";
  import { convertZenkakuHiraganaToHankakuKatakana } from "../zenkaku";
  import { DateWrapper } from "myclinic-util";
  import { isUnder6 } from "../futan-wari";
  import { isKokuho } from "myclinic-rezept/helper";
  import {
    RezeptShubetsuCodeBase,
    RezeptShubetuCodeOffset,
  } from "myclinic-rezept/codes";
  import { renderDrug, type RenderedDrug } from "./presc-renderer";
  import { sign_presc } from "../hpki-api";
  import * as cache from "@/lib/cache";
  import {
    modifyPresc,
    prescStatus,
    registerPresc,
    shohouHikae,
    shohouHikaeFilename,
    unregisterPresc,
  } from "./presc-api";
  import {
    checkShohouResult,
    type HikaeResult,
    type RegisterResult,
  } from "./shohou-interface";
  import {
    modifyTextMemo,
    type ShohouTextMemo,
  } from "@/practice/exam/record/text/text-memo";
  import { Text } from "myclinic-model";
  import api from "../api";
  import ShohouFormDialog from "./ShohouFormDialog.svelte";

  export let destroy: () => void;
  export let patient: Patient;
  export let hokenInfo: HokenInfo;
  export let visit: Visit;
  export let shohou: PrescInfoData | undefined = undefined;
  export let prescriptionId: string | undefined = undefined;
  export let textId: number = 0;
  let renderedDrugs: RenderedDrug[] = [];
  let shohouModified = false;

  init();

  async function init() {
    if (!shohou) {
      shohou = await initShohou();
    }
    adaptToShohou();
  }

  function adaptToShohou() {
    if (shohou) {
      renderedDrugs = shohou.RP剤情報グループ.map((g) => renderDrug(g));
    } else {
      renderedDrugs = [];
    }
  }

  async function initShohou(): Promise<PrescInfoData> {
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
    return {
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
      RP剤情報グループ: [],
    };
  }

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

  function doAdd() {
    const form: ShohouFormDialog = new ShohouFormDialog({
      target: document.body,
      props: {
        destroy: () => form.$destroy(),
        at: DateWrapper.from(visit.visitedAt).asSqlDate(),
        onEnter: (drug) => {
          if (shohou) {
            shohou.RP剤情報グループ.push(drug);
            adaptToShohou();
            shohouModified = true;
          }
        },
      },
    });
  }

  function doFreq() {}

  async function doRegister() {
    if (shohou && !shohou.引換番号) {
      const prescInfo = createPrescInfo(shohou);
      const signed = await sign_presc(prescInfo);
      const kikancode = await cache.getShohouKikancode();
      let result = await registerPresc(signed, kikancode, "1");
      let register: RegisterResult = JSON.parse(result);
      if (register.XmlMsg.MessageBody?.CsvCheckResultList) {
        let list = register.XmlMsg.MessageBody?.CsvCheckResultList;
        if (list.length > 0) {
          let ms = list.map((item) => item.ResultMessage).join("\n");
          alert(ms);
        }
      }
      shohou.引換番号 = register.XmlMsg.MessageBody?.AccessCode;
      prescriptionId = register.XmlMsg.MessageBody?.PrescriptionId;
      let memo: ShohouTextMemo = {
        kind: "shohou",
        shohou,
        prescriptionId,
      };
      if (textId === 0) {
        let text: Text = {
          textId: 0,
          visitId: visit.visitId,
          content: "",
        };
        text = modifyTextMemo(text, (m) => memo);
        await api.enterText(text);
      } else {
        let text = await api.getText(textId);
        text = modifyTextMemo(text, (m) => memo);
        await api.updateText(text);
      }
      destroy();
      if (prescriptionId) {
        await saveHikae(kikancode, prescriptionId);
      }
    }
  }

  async function doModify() {
    if (shohou && prescriptionId && shohouModified && textId !== 0) {
      console.log("enter modify", prescriptionId);
      const prescInfo = createPrescInfo(shohou);
      const signed = await sign_presc(prescInfo);
      const kikancode = await cache.getShohouKikancode();
      let resultText = await modifyPresc(
        prescriptionId,
        signed,
        kikancode,
        "1"
      );
      console.log("result", resultText);
      const result: RegisterResult = JSON.parse(resultText);
      shohou.引換番号 = result.XmlMsg.MessageBody?.AccessCode;
      prescriptionId = result.XmlMsg.MessageBody?.PrescriptionId;
      let memo: ShohouTextMemo = {
        kind: "shohou",
        shohou,
        prescriptionId,
      };
      let text = await api.getText(textId);
      text = modifyTextMemo(text, (m) => memo);
      await api.updateText(text);
      destroy();
      if (prescriptionId) {
        console.log("prescriptionId", prescriptionId);
        await saveHikae(kikancode, prescriptionId);
      }
    }
  }

  async function doSave() {
    if (shohou && !shohou.引換番号) {
      const memo: ShohouTextMemo = {
        kind: "shohou",
        shohou,
        prescriptionId: undefined,
      };
      if (textId === 0) {
        let text = modifyTextMemo(
          {
            textId: 0,
            visitId: visit.visitId,
            content: "",
          },
          (m) => memo
        );
        await api.enterText(text);
      } else {
        let text = await api.getText(textId);
        text = modifyTextMemo(text, (m) => memo);
        await api.updateText(text);
      }
      destroy();
    }
  }

  async function saveHikae(kikancode: string, prescriptionId: string) {
    let resultString = await shohouHikae(kikancode, prescriptionId);
    let result: HikaeResult = JSON.parse(resultString);
    let err = checkShohouResult(result);
    if (err) {
      alert(err);
      return;
    }
    let base64 = result.XmlMsg.MessageBody.PrescriptionReferenceInformationFile;
    let filename = shohouHikaeFilename(prescriptionId);
    await api.decodeBase64ToFile(filename, base64);
  }

  async function doUnregister() {
    async function unregister(textId: number) {
      let text = await api.getText(textId);
      text = modifyTextMemo(text, (m) => {
        if (m) {
          m.prescriptionId = undefined;
          m.shohou.引換番号 = undefined;
        }
        return m;
      });
      await api.updateText(text);
    }
    if (prescriptionId && shohou && textId !== 0) {
      if (!confirm("この処方の発行を取消ていいですか？")) {
        return;
      }
      const kikancode = await cache.getShohouKikancode();
      const result = await unregisterPresc(kikancode, prescriptionId);
      if (
        result.XmlMsg.MessageHeader.SegmentOfResult === "1" &&
        result.XmlMsg.MessageBody.ProcessingResultStatus === "1"
      ) {
        await unregister(textId);
        destroy();
        return;
      }
      if (
        result.XmlMsg.MessageHeader.SegmentOfResult === "1" &&
        result.XmlMsg.MessageBody.ProcessingResultStatus === "2" &&
        result.XmlMsg.MessageBody.ProcessingResultCode === "EPSB1032W"
      ) {
        const status = await prescStatus(kikancode, prescriptionId);
        if (
          status.XmlMsg.MessageBody.PrescriptionStatus ===
          "当該処方箋は処方箋取消されています。"
        ) {
          await unregister(textId);
          destroy();
          return;
        }
      }
      let msg =
        result.XmlMsg.MessageHeader.ErrorMessage ||
        result.XmlMsg.MessageBody.ProcessingResultMessage;
      alert(`エラー：${msg}`);
    }
  }

  function doEditRpDrug(index: number) {
    if (shohou) {
      const rp = shohou.RP剤情報グループ[index];
      const d: ShohouFormDialog = new ShohouFormDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          at: visit.visitedAt.substring(0, 10),
          rpPresc: rp,
          onEnter: (rpModified) => {
            console.log("modified", rpModified);
            if (shohou) {
              shohou.RP剤情報グループ[index] = rpModified;
              shohou = shohou;
              adaptToShohou();
              shohouModified = true;
            }
          },
        },
      });
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<Dialog title={textId === 0 ? "新規処方" : "処方編集"} {destroy}>
  <div class="top">
    <div>院外処方</div>
    <div>Ｒｐ）</div>
    <div>
      {#each renderedDrugs as drug, i (drug.id)}
        <div
          style="cursor:pointer;user-select:none;display:grid;grid-template-columns:auto 1fr;column-gap:4px;"
          on:click={() => doEditRpDrug(i)}
        >
          <div>{i + 1})</div>
          <div>
            {#each drug.drugs as d}
              <div>{d}</div>
            {/each}
          </div>
          <div></div>
          <div>{drug.usage} {drug.times}</div>
        </div>
      {/each}
    </div>
    <div>
      <button on:click={doFreq}>登録薬剤</button>
      <button on:click={doAdd}>手動追加</button>
    </div>
    <div class="commands">
      {#if shohou && shohou.RP剤情報グループ.length > 0}
        {#if shohou.引換番号 == undefined}
          <button on:click={doRegister}>発行</button>
          <button on:click={doSave}>保存</button>
        {/if}
      {/if}
      {#if shohou && prescriptionId && shohouModified}
        <button on:click={doModify}>変更登録</button>
      {/if}
      {#if prescriptionId}
        <button on:click={doUnregister}>発行取消</button>
      {/if}
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
