<script lang="ts">
  import type { HokenInfo, Kouhi, Patient, Visit } from "myclinic-model";
  import { cache } from "../cache";
  import Dialog from "../Dialog.svelte";
  import {
    createPrescInfo,
    type PrescInfoData,
    type 備考レコード,
  } from "./presc-info";
  import { DateWrapper } from "myclinic-util";
  import { renderDrug, type RenderedDrug } from "./presc-renderer";
  import { sign_presc } from "../hpki-api";
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
  import { initPrescInfoData } from "./visit-shohou";

  export let destroy: () => void;
  export let patient: Patient;
  export let hokenInfo: HokenInfo;
  export let visit: Visit;
  export let shohou: PrescInfoData | undefined = undefined;
  export let prescriptionId: string | undefined = undefined;
  export let textId: number = 0;
  let renderedDrugs: RenderedDrug[] = [];
  let shohouModified = false;
  let showBikou = false;
  let formBikou一包化 = false;
  let formBikouInputText = "";

  init();

  async function init() {
    if (!shohou) {
      shohou = await initShohou();
    } else {
      console.log("shohou", shohou);
    }
    adaptToShohou();
  }

  function adaptToShohou() {
    if (shohou) {
      renderedDrugs = shohou.RP剤情報グループ.map((g) => renderDrug(g));
      formBikou一包化 = hasBikou一包化(shohou);
    } else {
      renderedDrugs = [];
      formBikou一包化 = false;
    }
  }

  function hasBikou一包化(s: PrescInfoData | undefined): boolean {
    return !!s?.備考レコード?.find((b) => b.備考 === "一包化");
  }

  async function initShohou(): Promise<PrescInfoData> {
    const clinicInfo = await cache.getClinicInfo();
    return initPrescInfoData(visit, patient, hokenInfo, clinicInfo);
  }

  // async function initShohou(): Promise<PrescInfoData> {
  //   function toKana(s: string): string {
  //     return convertZenkakuHiraganaToHankakuKatakana(s);
  //   }
  //   const clinicInfo = await getClinicInfo();
  //   let kikancode = clinicInfo.kikancode;
  //   const postalCode = clinicInfo.postalCode.replace(/^〒/, "");
  //   const patientNameKana = `${toKana(patient.lastNameYomi)} ${toKana(patient.firstNameYomi)}`;
  //   let 第一公費レコード = resolve公費レコード(hokenInfo.kouhiList[0]);
  //   let 第二公費レコード = resolve公費レコード(hokenInfo.kouhiList[1]);
  //   let 第三公費レコード = resolve公費レコード(hokenInfo.kouhiList[2]);
  //   return {
  //     医療機関コード種別: "医科",
  //     医療機関コード: kikancode,
  //     医療機関都道府県コード: castTo都道府県コード(clinicInfo.todoufukencode),
  //     医療機関名称: clinicInfo.name,
  //     医療機関郵便番号: postalCode,
  //     医療機関所在地: clinicInfo.address,
  //     医療機関電話番号: clinicInfo.tel,
  //     ＦＡＸ番号: clinicInfo.fax,
  //     診療科レコード: {
  //       診療科コード種別: "診療科コード",
  //       診療科コード: "内科",
  //     },
  //     医師漢字氏名: `${clinicInfo.doctorLastName}　${clinicInfo.doctorFirstName}`,
  //     患者コード: patient.patientId.toString(),
  //     患者漢字氏名: `${patient.lastName}　${patient.firstName}`, // 性と名は全角スペースで区切る。
  //     患者カナ氏名: patientNameKana, // 半角カナで記録する。姓と名は半角スペースで区切る。
  //     患者性別: patient.sex === "M" ? "男" : "女",
  //     患者生年月日: DateWrapper.from(patient.birthday)
  //       .asSqlDate()
  //       .replaceAll(/-/g, ""),
  //     保険一部負担金区分: resolve保険一部負担金区分(hokenInfo, patient, visit),
  //     保険種別: resolve保険種別(hokenInfo),
  //     保険者番号: resolve保険者番号(hokenInfo),
  //     被保険者証記号: resolve被保険者証記号(hokenInfo),
  //     被保険者証番号: resolve被保険者証番号(hokenInfo),
  //     被保険者被扶養者: resolve被保険者被扶養者(hokenInfo),
  //     被保険者証枝番: resolve被保険者証枝番(hokenInfo),
  //     第一公費レコード,
  //     第二公費レコード,
  //     第三公費レコード,
  //     特殊公費レコード: undefined,
  //     レセプト種別コード: resolveレセプト種別コード(hokenInfo),
  //     処方箋交付年月日: DateWrapper.from(visit.visitedAt)
  //       .asSqlDate()
  //       .replaceAll(/-/g, ""),
  //     RP剤情報グループ: [],
  //   };
  // }

  function doCancel() {
    destroy();
  }

  function doAdd() {
    const form: ShohouFormDialog = new ShohouFormDialog({
      target: document.body,
      props: {
        destroy: () => form.$destroy(),
        at: DateWrapper.from(visit.visitedAt).asSqlDate(),
        onEnter: (drug) => {
          if (shohou) {
            let rg = [...shohou.RP剤情報グループ, drug];
            shohou = Object.assign({}, shohou, {
              RP剤情報グループ: rg,
            });
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
      console.log("prescInfo", prescInfo);
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
            if (shohou) {
              let rg = [...shohou.RP剤情報グループ];
              rg[index] = rpModified;
              shohou = Object.assign({}, shohou, {
                RP剤情報グループ: rg,
              });
              adaptToShohou();
              shohouModified = true;
            }
          },
          onDelete: (rpPresc) => {
            if (shohou) {
              let rg = [...shohou.RP剤情報グループ];
              rg.splice(index, 1);
              shohou = Object.assign({}, shohou, {
                RP剤情報グループ: rg,
              });
              adaptToShohou();
              shohouModified = true;
            }
          },
        },
      });
    }
  }

  function doToggleBikou() {
    showBikou = !showBikou;
  }

  function setBikou一包化() {
    if (shohou) {
      let bikou = shohou.備考レコード;
      if (bikou) {
        if (bikou.find((b) => b.備考 === "一包化")) {
          return;
        }
        bikou = [...bikou];
        bikou.push({ 備考: "一包化" });
      } else {
        bikou = [{ 備考: "一包化" }];
      }
      shohou = Object.assign({}, shohou, {
        備考レコード: bikou,
      });
      adaptToShohou();
      shohouModified = true;
    }
  }

  function clearBikou一包化() {
    if (shohou) {
      let bikou = shohou.備考レコード;
      if (bikou) {
        if (!bikou.find((b) => b.備考 === "一包化")) {
          return;
        }
        bikou = [...bikou].filter((b) => b.備考 !== "一包化");
      } else {
        return;
      }
      shohou = Object.assign({}, shohou, {
        備考レコード: bikou,
      });
      adaptToShohou();
      shohouModified = true;
    }
  }

  function doFormBikou一包化Changed() {
    if (formBikou一包化) {
      setBikou一包化();
    } else {
      clearBikou一包化();
    }
  }

  function doAddBikouText() {
    if (!shohou) {
      return;
    }
    formBikouInputText = formBikouInputText.trim();
    if (formBikouInputText === "") {
      return;
    }
    const bs: 備考レコード[] = [
      ...(shohou.備考レコード ?? []),
      { 備考: formBikouInputText },
    ];
    shohou = Object.assign({}, shohou, { 備考レコード: bs });
    adaptToShohou();
    shohouModified = true;
    formBikouInputText = "";
  }

  function doDeleteBikou(index: number) {
    if (!shohou || !shohou.備考レコード) {
      return;
    }
    let bs: 備考レコード[] = [...shohou.備考レコード];
    bs.splice(index, 1);
    shohou = Object.assign({}, shohou, { 備考レコード: bs });
    adaptToShohou();
    shohouModified = true;
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
      <a href="javascript:void(0)" on:click={doToggleBikou}>備考</a>
    </div>
    {#if showBikou}
      <div>
        <input
          type="checkbox"
          bind:checked={formBikou一包化}
          on:change={doFormBikou一包化Changed}
        />
        一包化
      </div>
      {#each shohou?.備考レコード ?? [] as b, i}
        {#if b.備考 !== "一包化"}
          <div on:click={doAddBikouText}>
            {b.備考}
            <a href="javascript:void(0)" on:click={() => doDeleteBikou(i)}
              >削除</a
            >
          </div>
        {/if}
      {/each}
      <input type="text" bind:value={formBikouInputText} />
      <button on:click={doAddBikouText}>追加</button>
    {/if}
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
  .commands {
    text-align: right;
    margin-top: 10px;
  }
</style>
