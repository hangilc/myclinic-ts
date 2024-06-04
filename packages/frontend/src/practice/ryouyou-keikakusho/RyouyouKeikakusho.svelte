<script lang="ts">
  import type { Op } from "@/lib/drawer/compiler/op";
  import { drawRyouyouKeikakushoShokai } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-shokai-drawer";
  import { drawRyouyouKeikakushoKeizoku } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-keizoku-drawer";
  import {
    mkRyouyouKeikakushoData,
    type RyouyouKeikakushoData,
  } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-data";
  import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";
  import api from "@/lib/api";
  import type { ClinicInfo, Patient } from "myclinic-model";
  import SearchPatientDialog from "@/lib/SearchPatientDialog.svelte";
  import { createInputs } from "@/lib/drawer/forms/ryouyou-keikakusho/meta";
  import ChevronDown from "@/icons/ChevronDown.svelte";
  import ChevronUp from "@/icons/ChevronUp.svelte";
  import { DateWrapper, calcAge } from "myclinic-util";
  import { KanjiDate } from "kanjidate";
  import { sqlDateToDate } from "@/lib/date-util";
  import { mkFormData, type FormData } from "./form-data";

  export let isVisible = false;
  let showDev = false;
  let patient: Patient | undefined = undefined;
  let formMode: "input" | "store" = "input";
  let formData: FormData = mkFormData();
  let ryouyouKeikakushoData: RyouyouKeikakushoData = mkRyouyouKeikakushoData();
  let store: string = "";
  let clinicInfo: ClinicInfo | undefined = undefined;
  let formAreaWork: HTMLElement;

  function calcCheck(shokujiCheck: boolean, values: boolean[]): boolean {
    return shokujiCheck || values.some((b) => b);
  }

  function adaptShokujiChecks() {
    if (!formData.shokujiChecks["juuten-食事-外食の際の注意事項-mark"]) {
      formData.shokujiChecks["juuten-食事-外食の際の注意事項-mark"] =
        formData.immediates["juuten-食事-外食の際の注意事項"] !== "";
    }
    if (!formData.shokujiChecks["juuten-食事-節酒-mark"]) {
      formData.shokujiChecks["juuten-食事-節酒-mark"] =
        formData.immediates["juuten-食事-節酒"] !== "" ||
        formData.immediates["juuten-食事-節酒-回"] !== "";
    }
    if (!formData.shokujiChecks["juuten-食事-間食-mark"]) {
      formData.shokujiChecks["juuten-食事-間食-mark"] =
        formData.immediates["juuten-食事-間食"] !== "" ||
        formData.immediates["juuten-食事-間食-回"] !== "";
    }
    if (!formData.shokujiChecks["juuten-食事-食べ方-mark"]) {
      formData.shokujiChecks["juuten-食事-食べ方-mark"] =
        formData.shokujiYukkuri ||
        formData.immediates["juuten-食事-食べ方"] !== "";
    }
    if (!formData.shokujiCheck) {
      formData.shokujiCheck = Object.values(formData.shokujiChecks).some(
        (checked) => checked
      );
    }
  }

  function adaptUndouChecks() {
    if (!formData.undouChecks["juuten-運動-種類-mark"]) {
      formData.undouChecks["juuten-運動-種類-mark"] =
        formData.undouWalking ||
        formData.immediates["juuten-運動-種類"] !== "" ||
        formData.immediates["juuten-運動-時間"] !== "" ||
        formData.undouEveryDay ||
        formData.immediates["juuten-運動-頻度"] !== "" ||
        formData.undouIntensityBreath ||
        formData.immediates["juuten-運動-強度-脈拍"] !== "" ||
        formData.immediates["juuten-運動-強度-その他"] !== "";
    }
    if (!formData.undouChecks["juuten-運動-活動量-mark"]) {
      formData.undouChecks["juuten-運動-活動量-mark"] =
        formData.undouChecks["juuten-運動-活動量-mark"] ||
        formData.immediates["juuten-運動-活動量"] !== "";
    }
    if (!formData.undouChecks["juuten-運動-注意事項-mark"]) {
      formData.undouChecks["juuten-運動-注意事項-mark"] =
        formData.undouChecks["juuten-運動-注意事項-mark"] ||
        formData.immediates["juuten-運動-注意事項"] !== "";
    }
    if (!formData.undouCheck) {
      formData.undouCheck = Object.values(formData.undouChecks).some(
        (checked) => checked
      );
    }
  }

  function adaptTabakoChecks() {
    if (!formData.undouChecks["juuten-運動-注意事項-mark"]) {
      formData.undouChecks["juuten-運動-注意事項-mark"] =
        formData.undouChecks["juuten-運動-注意事項-mark"] ||
        formData.immediates["juuten-運動-注意事項"] !== "";
    }
    if (!formData.tabakoCheck) {
      formData.tabakoCheck = Object.values(formData.tabakoChecks).some(
        (checked) => checked
      );
    }
  }

  function adaptSonotaChecks() {
    if (!formData.sonotaChecks["juuten-その他-その他-mark"]) {
      formData.sonotaChecks["juuten-その他-その他-mark"] =
        formData.sonotaChecks["juuten-その他-その他-mark"] ||
        formData.immediates["juuten-その他-その他"] !== "";
    }
    if (!formData.sonotaCheck) {
      formData.sonotaCheck = Object.values(formData.sonotaChecks).some(
        (checked) => checked
      );
    }
  }

  function adaptKensaChecks() {
    if (!formData.kensaChecks["kensa-血糖-食後-mark"]) {
      formData.kensaChecks["kensa-血糖-食後-mark"] =
        formData.immediates["kensa-血糖-食後"] !== "";
    }
    if (!formData.kensaChecks["kensa-血糖-mark"]) {
      formData.kensaChecks["kensa-血糖-mark"] =
        formData.kensaChecks["kensa-血糖-mark"] ||
        formData.kensaChecks["kensa-血糖-空腹時-mark"] ||
        formData.kensaChecks["kensa-血糖-随時-mark"] ||
        formData.kensaChecks["kensa-血糖-食後-mark"] ||
        formData.immediates["kensa-血糖-値"] !== "";
    }
    if (!formData.kensaChecks["kensa-HbA1c-mark"]) {
      formData.kensaChecks["kensa-HbA1c-mark"] =
        formData.immediates["kensa-HbA1c"] !== "";
    }
    if (!formData.kensaChecks["kensa-総コレステロール-mark"]) {
      formData.kensaChecks["kensa-総コレステロール-mark"] =
        formData.immediates["kensa-総コレステロール"] !== "";
    }
    if (!formData.kensaChecks["kensa-中性脂肪-mark"]) {
      formData.kensaChecks["kensa-中性脂肪-mark"] =
        formData.immediates["kensa-中性脂肪"] !== "";
    }
    if (!formData.kensaChecks["kensa-ＨＤＬコレステロール-mark"]) {
      formData.kensaChecks["kensa-ＨＤＬコレステロール-mark"] =
        formData.immediates["kensa-ＨＤＬコレステロール"] !== "";
    }
    if (!formData.kensaChecks["kensa-ＬＤＬコレステロール-mark"]) {
      formData.kensaChecks["kensa-ＬＤＬコレステロール-mark"] =
        formData.immediates["kensa-ＬＤＬコレステロール"] !== "";
    }
    if (!formData.kensaChecks["kensa-血液検査項目-その他-mark"]) {
      formData.kensaChecks["kensa-血液検査項目-その他-mark"] =
        formData.immediates["kensa-血液検査項目-その他"] !== "";
    }
    if (!formData.kensaChecks["kensa-栄養状態-mark"]) {
      formData.kensaChecks["kensa-栄養状態-mark"] =
        formData.kensaChecks["kensa-栄養状態-低栄養状態の恐れ"] ||
        formData.kensaChecks["kensa-栄養状態-良好"] ||
        formData.kensaChecks["kensa-栄養状態-肥満"];
    }
    if (!formData.kensaChecks["kensa-その他-その他-mark"]) {
      formData.kensaChecks["kensa-その他-その他-mark"] =
        formData.immediates["kensa-その他-その他"] !== "";
    }
  }

  function adaptChecks() {
    adaptShokujiChecks();
    adaptUndouChecks();
    adaptTabakoChecks();
    adaptSonotaChecks();
    adaptKensaChecks();
  }

  // $: formData.kensaChecks["kensa-栄養状態-mark"] = calcCheck(
  //   formData.kensaChecks["kensa-栄養状態-mark"],
  //   [
  //     formData.kensaChecks["kensa-栄養状態-低栄養状態の恐れ"],
  //     formData.kensaChecks["kensa-栄養状態-良好"],
  //     formData.kensaChecks["kensa-栄養状態-肥満"],
  //   ]
  // );

  // $: formData.kensaChecks["kensa-その他-その他-mark"] = calcCheck(
  //   formData.kensaChecks["kensa-その他-その他-mark"],
  //   [formData.immediates["kensa-その他-その他"] !== ""]
  // );

  // $: if (formData.diseaseDiabetes) {
  //   if (formData.mode === "shokai") {
  //     const t = formData.immediates["mokuhyou-達成目標"];
  //     const m = "HbA1c値を 7.0 以下にコントロールする。";
  //     if (!t || t.indexOf(m) < 0) {
  //       formData.immediates["mokuhyou-達成目標"] = `${t}${m}`;
  //     }
  //     if (formData.immediates["mokuhyou-HbA1c"] === "") {
  //       formData.immediates["mokuhyou-HbA1c"] = "7.0";
  //     }
  //   }
  // }

  const default行動目標 =
    "現在の食事、運動を継続する。現在の処方の服用を継続する。";

  function adaptDiabetes() {
    if (formData.diseaseDiabetes) {
      if (formData.immediates["mokuhyou-HbA1c"] === "") {
        formData.immediates["mokuhyou-HbA1c"] = "7.0";
      }
      const t = formData.immediates["mokuhyou-達成目標"];
      const m = "HbA1c の値を 7.0 以下にコントロールする。";
      if (!t || t.indexOf(m) < 0) {
        formData.immediates["mokuhyou-達成目標"] = `${t}${m}`;
      }
      if (formData.immediates["mokuhyou-行動目標"] === "") {
        formData.immediates["mokuhyou-行動目標"] = default行動目標;
      }
      adaptChecks();
    }
  }

  function adaptHypertension() {
    if (formData.diseaseHypertension) {
      if (formData.immediates["mokuhyou-BP"] === "") {
        formData.immediates["mokuhyou-BP"] = "130/80";
      }
      const t = formData.immediates["mokuhyou-達成目標"];
      const m = "血圧の平均を 130/80 以下にコントロールする。";
      if (!t || t.indexOf(m) < 0) {
        formData.immediates["mokuhyou-達成目標"] = `${t}${m}`;
      }
      if (formData.immediates["mokuhyou-行動目標"] === "") {
        formData.immediates["mokuhyou-行動目標"] = default行動目標;
      }
      formData.shokujiChecks["juuten-食事-食塩・調味料を控える-mark"] = true;
      adaptChecks();
    }
  }

  function adaptHyperlipidemia() {
    const t = formData.immediates["mokuhyou-達成目標"];
    const m = "ＬＤＬコレステロールの値を 140 以下にコントロールする。";
    if (!t || t.indexOf(m) < 0) {
      formData.immediates["mokuhyou-達成目標"] = `${t}${m}`;
    }
    if (formData.immediates["mokuhyou-行動目標"] === "") {
      formData.immediates["mokuhyou-行動目標"] = default行動目標;
    }
    adaptChecks();
  }

  init();

  async function init() {
    clinicInfo = await api.getClinicInfo();
  }

  function updateBox(key: keyof RyouyouKeikakushoData, checked: boolean) {
    updateValue(key, checked ? "1" : "");
  }

  function updateValue(key: keyof RyouyouKeikakushoData, value: string) {
    ryouyouKeikakushoData[key] = value;
  }

  function populateDiseases() {
    updateBox("disease-diabetes", formData.diseaseDiabetes);
    updateBox("disease-hypertension", formData.diseaseHypertension);
    updateBox("disease-hyperlipidemia", formData.diseaseHyperlipidemia);
  }

  function populateMokuhyou() {
    updateBox(
      "mokuhyou-体重-mark",
      formData.immediates["mokuhyou-体重"] !== ""
    );
    updateBox("mokuhyou-BMI-mark", formData.immediates["mokuhyou-BMI"] !== "");
    updateBox("mokuhyou-BP-mark", formData.immediates["mokuhyou-BP"] !== "");
    updateBox(
      "mokuhyou-HbA1c-mark",
      formData.immediates["mokuhyou-HbA1c"] !== ""
    );
  }

  function populateShokuji() {
    for (const key in formData.shokujiChecks) {
      // @ts-ignore
      updateBox(key, formData.shokujiChecks[key]);
    }
    updateBox("juuten-食事-mark", formData.shokujiCheck);
    updateBox("juuten-食事-食べ方-ゆっくり食べる", formData.shokujiYukkuri);
  }

  function populateUndou() {
    for (const key in formData.undouChecks) {
      // @ts-ignore
      updateBox(key, formData.undouChecks[key]);
    }
    updateBox("juuten-運動-ウォーキング-mark", formData.undouWalking);
    updateBox("juuten-運動-mark", formData.undouCheck);
  }

  function populateTabako() {
    for (const key in formData.tabakoChecks) {
      // @ts-ignore
      updateBox(key, formData.tabakoChecks[key]);
    }
    updateBox("juuten-たばこ-mark", formData.tabakoCheck);
  }

  function populateSonota() {
    for (const key in formData.sonotaChecks) {
      // @ts-ignore
      updateBox(key, formData.sonotaChecks[key]);
    }
    updateBox("juuten-その他-mark", formData.sonotaCheck);
  }

  function populateKensa() {
    if (formData.kensaDate !== "") {
      const issueDate = DateWrapper.from(formData.kensaDate);
      updateValue("kensa-採血日-月", issueDate.getMonth().toString());
      updateValue("kensa-採血日-日", issueDate.getDay().toString());
    }
    for (const key in formData.kensaChecks) {
      // @ts-ignore
      updateBox(key, formData.kensaChecks[key]);
    }
  }

  function doSelectPatient() {
    const d: SearchPatientDialog = new SearchPatientDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "患者選択",
        onEnter: (selected: Patient) => {
          patient = selected;
        },
      },
    });
  }

  function doClearPatient() {
    patient = undefined;
    formData = mkFormData();
  }

  function doDisp() {
    ryouyouKeikakushoData = mkRyouyouKeikakushoData();
    if (clinicInfo) {
      ryouyouKeikakushoData["医師氏名"] = clinicInfo?.doctorName;
    }
    populateWithIssueDate();
    populateWithPatient();
    populateDiseases();
    populateMokuhyou();
    populateShokuji();
    populateUndou();
    populateTabako();
    populateSonota();
    populateKensa();
    for (let key in formData.immediates) {
      // @ts-ignore
      ryouyouKeikakushoData[key] = formData.immediates[key];
    }
    let ops: Op[];
    if (formData.mode === "shokai") {
      ops = drawRyouyouKeikakushoShokai(ryouyouKeikakushoData);
    } else {
      ops = drawRyouyouKeikakushoKeizoku(ryouyouKeikakushoData);
    }
    const d: DrawerDialog = new DrawerDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        ops,
        viewBox: "0 0 210 297",
        scale: 2,
      },
    });
  }

  function doCreateForm() {
    console.log(createInputs());
    alert("code output to console");
  }

  function onFormModeChange() {
    if (formMode === "input") {
    } else if (formMode === "store") {
    }
  }

  function populateWithIssueDate() {
    if (formData.issueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const d = DateWrapper.from(formData.issueDate);
      ryouyouKeikakushoData["issue-year"] = d.getYear().toString();
      ryouyouKeikakushoData["issue-month"] = d.getMonth().toString();
      ryouyouKeikakushoData["issue-day"] = d.getDay().toString();
    } else {
      ryouyouKeikakushoData["issue-year"] = "";
      ryouyouKeikakushoData["issue-month"] = "";
      ryouyouKeikakushoData["issue-day"] = "";
    }
  }

  function populateWithPatient() {
    if (patient) {
      ryouyouKeikakushoData["patient-name"] =
        `${patient.lastName}${patient.firstName}`;
      switch (patient.sex) {
        case "M": {
          ryouyouKeikakushoData["patient-sex-male"] = "1";
          ryouyouKeikakushoData["patient-sex-female"] = "";
          break;
        }
        case "F": {
          ryouyouKeikakushoData["patient-sex-male"] = "";
          ryouyouKeikakushoData["patient-sex-female"] = "1";
          break;
        }
      }
      const d = new KanjiDate(sqlDateToDate(patient.birthday));
      switch (d.gengou) {
        case "明治": {
          ryouyouKeikakushoData["birthdate-gengou-meiji"] = "1";
          break;
        }
        case "大正": {
          ryouyouKeikakushoData["birthdate-gengou-taishou"] = "1";
          break;
        }
        case "昭和": {
          ryouyouKeikakushoData["birthdate-gengou-shouwa"] = "1";
          break;
        }
        case "平成": {
          ryouyouKeikakushoData["birthdate-gengou-heisei"] = "1";
          break;
        }
        case "令和": {
          ryouyouKeikakushoData["birthdate-gengou-reiwa"] = "1";
          break;
        }
      }
      ryouyouKeikakushoData["birthdate-nen"] = d.nen.toString();
      ryouyouKeikakushoData["birthdate-month"] = d.month.toString();
      ryouyouKeikakushoData["birthdate-day"] = d.day.toString();
      const age = calcAge(patient.birthday, formData.issueDate || new Date());
      ryouyouKeikakushoData["patient-age"] = age.toString();
    } else {
      ryouyouKeikakushoData["patient-name"] = "";
      ryouyouKeikakushoData["patient-sex-male"] = "";
      ryouyouKeikakushoData["patient-sex-female"] = "";
      ryouyouKeikakushoData["birthdate-gengou-meiji"] = "";
      ryouyouKeikakushoData["birthdate-gengou-taishou"] = "";
      ryouyouKeikakushoData["birthdate-gengou-shouwa"] = "";
      ryouyouKeikakushoData["birthdate-gengou-heisei"] = "";
      ryouyouKeikakushoData["birthdate-gengou-reiwa"] = "";
      ryouyouKeikakushoData["birthdate-nen"] = "";
      ryouyouKeikakushoData["birthdate-month"] = "";
      ryouyouKeikakushoData["birthdate-day"] = "";
      ryouyouKeikakushoData["patient-age"] = "";
    }
  }
</script>

{#if isVisible}
  <div>
    {#if patient === undefined}
      <button on:click={doSelectPatient}>患者選択</button>
    {:else}
      <button on:click={doClearPatient}>患者終了</button>
    {/if}
  </div>
  <div>
    {#if patient}
      ({patient.patientId}) {patient.lastName} {patient.firstName}
    {/if}
  </div>
  <div class="form-area">
    <div>
      <input
        type="radio"
        value="input"
        bind:group={formMode}
        on:change={onFormModeChange}
      />
      Input
      <input
        type="radio"
        value="store"
        bind:group={formMode}
        on:change={onFormModeChange}
      /> Store
    </div>
    <div class="form-area-work" bind:this={formAreaWork}>
      {#if formMode === "input"}
        <div>
          <input type="radio" value="shokai" bind:group={formData.mode} /> 初回
          <input type="radio" value="keizoku" bind:group={formData.mode} /> 継続
        </div>
        <div>
          発行日：<input type="text" bind:value={formData.issueDate} />
        </div>
        <div>
          主病：<input
            type="checkbox"
            bind:checked={formData.diseaseDiabetes}
            on:change={adaptDiabetes}
          />
          糖尿病
          <input
            type="checkbox"
            bind:checked={formData.diseaseHypertension}
            on:change={adaptHypertension}
          />
          高血圧
          <input
            type="checkbox"
            bind:checked={formData.diseaseHyperlipidemia}
            on:change={adaptHyperlipidemia}
          /> 高脂血症
        </div>
        <div style="display:grid;grid-template-columns:auto 1fr;">
          <span>【目標】</span>
          <div style="line-height:1.8em">
            体重：<input
              type="text"
              style:width="6em"
              bind:value={formData.immediates["mokuhyou-体重"]}
            />
            kg BMI：<input
              type="text"
              style:width="6em"
              bind:value={formData.immediates["mokuhyou-BMI"]}
            />
            血圧：<input
              type="text"
              style:width="6em"
              bind:value={formData.immediates["mokuhyou-BP"]}
            />
            <span style="white-space:nowrap">
              HbA1c：<input
                type="text"
                style:width="6em"
                bind:value={formData.immediates["mokuhyou-HbA1c"]}
              />
            </span>
            <div style="display: flex; align-items:top;margin:4px 0;">
              【達成目標】
              <textarea
                style="width: 400px; height: 2.8em; resize: vertical"
                bind:value={formData.immediates["mokuhyou-達成目標"]}
              />
            </div>
            <div style="display: flex; align-items:top;margin:4px 0">
              【行動目標】
              <textarea
                style="width: 400px; height: 2.8em; resize: vertical"
                bind:value={formData.immediates["mokuhyou-行動目標"]}
              />
            </div>
          </div>
          <span style="grid-column-start:1;grid-column-end:3;"
            >【重点を置く領域と指導項目】</span
          >
        </div>
        <div style="margin-left:2em;">
          【<input bind:checked={formData.shokujiCheck} type="checkbox" />食事】
          <div style="margin-left: 2em">
            <div>
              <input
                type="checkbox"
                bind:checked={formData.shokujiChecks[
                  "juuten-食事-摂取量を適正にする-mark"
                ]}
                on:change={adaptChecks}
              /> 摂取量を適正にする
            </div>
            <div>
              <input
                type="checkbox"
                bind:checked={formData.shokujiChecks[
                  "juuten-食事-食塩・調味料を控える-mark"
                ]}
                on:change={adaptChecks}
              /> 食塩・調味料を控える
            </div>
            <div>
              <input
                type="checkbox"
                bind:checked={formData.shokujiChecks[
                  "juuten-食事-食物繊維の摂取を増やす-mark"
                ]}
                on:change={adaptChecks}
              /> 食物繊維の摂取を増やす
            </div>
            <div>
              <input
                type="checkbox"
                bind:checked={formData.shokujiChecks[
                  "juuten-食事-外食の際の注意事項-mark"
                ]}
                on:change={adaptChecks}
              />
              外食の際の注意事項
              <input
                type="text"
                bind:value={formData.immediates[
                  "juuten-食事-外食の際の注意事項"
                ]}
                on:change={adaptChecks}
              />
            </div>
            <div>
              <input
                type="checkbox"
                bind:checked={formData.shokujiChecks[
                  "juuten-食事-油を使った料理の摂取を減らす-mark"
                ]}
                on:change={adaptChecks}
              /> 油を使った料理の摂取を減らす
            </div>
            <div>
              <input
                type="checkbox"
                bind:checked={formData.shokujiChecks["juuten-食事-その他-mark"]}
                on:change={adaptChecks}
              /> その他
            </div>
            <div>
              <input
                type="checkbox"
                bind:checked={formData.shokujiChecks["juuten-食事-節酒-mark"]}
                on:change={adaptChecks}
              />
              節酒
              <input
                type="text"
                bind:value={formData.immediates["juuten-食事-節酒"]}
                on:change={adaptChecks}
              />
              を週
              <input
                type="text"
                bind:value={formData.immediates["juuten-食事-節酒-回"]}
                on:change={adaptChecks}
                style="width: 4em"
              /> 回
            </div>
            <div>
              <input
                type="checkbox"
                bind:checked={formData.shokujiChecks["juuten-食事-間食-mark"]}
                on:change={adaptChecks}
              />
              間食
              <input
                type="text"
                bind:value={formData.immediates["juuten-食事-間食"]}
                on:change={adaptChecks}
              />
              を週
              <input
                type="text"
                bind:value={formData.immediates["juuten-食事-間食-回"]}
                on:change={adaptChecks}
                style="width: 4em"
              /> 回
            </div>
            <div>
              <input
                type="checkbox"
                bind:checked={formData.shokujiChecks["juuten-食事-食べ方-mark"]}
                on:change={adaptChecks}
              />
              食べ方
              <input
                type="checkbox"
                bind:checked={formData.shokujiYukkuri}
                on:change={adaptChecks}
              />
              ゆっくり食べる
              <input
                type="text"
                bind:value={formData.immediates["juuten-食事-食べ方"]}
                on:change={adaptChecks}
              />
            </div>
            <div>
              <input
                type="checkbox"
                bind:checked={formData.shokujiChecks[
                  "juuten-食事-食事時間-mark"
                ]}
                on:change={adaptChecks}
              /> 食事時間
            </div>
          </div>
        </div>
        <div style="margin-left:2em;">
          【<input bind:checked={formData.undouCheck} type="checkbox" />運動】
          <div
            style="display:grid;grid-template-columns:auto 1fr;margin-left:2em;"
          >
            <span style="flex-basis:auto;flex-shrink:0"
              ><input
                type="checkbox"
                bind:checked={formData.undouChecks["juuten-運動-種類-mark"]}
                on:change={adaptChecks}
              />&nbsp;</span
            >
            <div style="flex-grow:1">
              <div>
                運動処方・種類（
                <input
                  type="checkbox"
                  bind:checked={formData.undouWalking}
                  on:change={adaptChecks}
                />
                ウォーキング
                <input
                  type="text"
                  bind:value={formData.immediates["juuten-運動-種類"]}
                  on:change={adaptChecks}
                />）
              </div>
              <div>
                時間（３０分以上 <input
                  type="text"
                  bind:value={formData.immediates["juuten-運動-時間"]}
                  on:change={adaptChecks}
                />）
              </div>
              <div>
                頻度<input
                  type="checkbox"
                  bind:checked={formData.undouEveryDay}
                  on:change={adaptChecks}
                />
                ほぼ毎日、 週
                <input
                  type="text"
                  style="width:4em"
                  bind:value={formData.immediates["juuten-運動-頻度"]}
                  on:change={adaptChecks}
                /> 日
              </div>
              <div style="display:flex;align-items:top">
                <span style="flex-basis:auto;flex-shrink:0">強度</span>
                <div style="flex-grow:1">
                  <input
                    type="checkbox"
                    bind:checked={formData.undouIntensityBreath}
                    on:change={adaptChecks}
                  />
                  息がはずむが会話が可能な強さ or
                  <input
                    type="text"
                    style="width:4em"
                    bind:value={formData.immediates["juuten-運動-強度-脈拍"]}
                    on:change={adaptChecks}
                  />
                  拍／分 or
                  <input
                    type="text"
                    bind:value={formData.immediates["juuten-運動-強度-その他"]}
                    on:change={adaptChecks}
                  />
                </div>
              </div>
            </div>
            <span style="flex-basis:auto;flex-shrink:0"
              ><input
                type="checkbox"
                bind:checked={formData.undouChecks["juuten-運動-活動量-mark"]}
                on:change={adaptChecks}
              />&nbsp;</span
            >
            <div>
              日常生活の活動量増加 <input
                type="text"
                bind:value={formData.immediates["juuten-運動-活動量"]}
                on:change={adaptChecks}
              />
            </div>
            <span style="flex-basis:auto;flex-shrink:0"
              ><input
                type="checkbox"
                bind:checked={formData.undouChecks["juuten-運動-注意事項-mark"]}
                on:change={adaptChecks}
              />&nbsp;</span
            >
            <div>
              運動時の注意事項など
              <input
                type="text"
                bind:value={formData.immediates["juuten-運動-注意事項"]}
                on:change={adaptChecks}
              />
            </div>
          </div>
        </div>
        <div style="margin-left:2em;">
          【<input
            bind:checked={formData.tabakoCheck}
            on:change={adaptChecks}
            type="checkbox"
          />たばこ】
          <div style="margin-left: 2em">
            <div>
              <input
                type="checkbox"
                bind:checked={formData.tabakoChecks[
                  "juuten-たばこ-非喫煙者-mark"
                ]}
                on:change={adaptChecks}
              /> 非喫煙者
            </div>
            <div>
              <input
                type="checkbox"
                bind:checked={formData.tabakoChecks[
                  "juuten-たばこ-禁煙・節煙の有効性-mark"
                ]}
                on:change={adaptChecks}
              /> 禁煙・節煙の有効性
            </div>
            <div>
              <input
                type="checkbox"
                bind:checked={formData.tabakoChecks[
                  "juuten-たばこ-禁煙の実施補法等-mark"
                ]}
                on:change={adaptChecks}
              /> 禁煙の実施補法等
            </div>
          </div>
        </div>
        <div style="margin-left:2em;">
          【<input
            bind:checked={formData.sonotaCheck}
            on:change={adaptChecks}
            type="checkbox"
          />その他】
          <div style="margin-left: 2em">
            <span style="white-space:nowrap">
              <input
                type="checkbox"
                bind:checked={formData.sonotaChecks["juuten-その他-仕事-mark"]}
                on:change={adaptChecks}
              /> 仕事
            </span>
            <span style="white-space:nowrap">
              <input
                type="checkbox"
                bind:checked={formData.sonotaChecks["juuten-その他-余暇-mark"]}
                on:change={adaptChecks}
              /> 余暇
            </span>
            <span style="white-space:nowrap">
              <input
                type="checkbox"
                bind:checked={formData.sonotaChecks[
                  "juuten-その他-睡眠の確保-mark"
                ]}
                on:change={adaptChecks}
              /> 睡眠の確保
            </span>
            <span style="white-space:nowrap">
              <input
                type="checkbox"
                bind:checked={formData.sonotaChecks["juuten-その他-減量-mark"]}
                on:change={adaptChecks}
              /> 減量
            </span>
            <span style="white-space:nowrap">
              <input
                type="checkbox"
                bind:checked={formData.sonotaChecks[
                  "juuten-その他-家庭での計測-mark"
                ]}
                on:change={adaptChecks}
              /> 家庭での計測
            </span>
            <div>
              <input
                type="checkbox"
                bind:checked={formData.sonotaChecks[
                  "juuten-その他-その他-mark"
                ]}
                on:change={adaptChecks}
              />
              その他
              <input
                type="text"
                bind:value={formData.immediates["juuten-その他-その他"]}
                on:change={adaptChecks}
              />
            </div>
          </div>
        </div>
        <div>
          <span>【検査】</span>
          <div
            style="display:grid;grid-template-columns:1fr 1fr;margin-left:2em;column-gap:6px"
          >
            <div>
              【血液検査項目】
              <span style="white-space:nowrap;"
                >採血日 <input
                  type="text"
                  style="width:6em"
                  bind:value={formData.kensaDate}
                /></span
              >
              <div style="display:grid;grid-template-columns:auto 1fr;">
                <span
                  ><input
                    type="checkbox"
                    bind:checked={formData.kensaChecks["kensa-血糖-mark"]}
                  />&nbsp;</span
                >
                <div>
                  血糖 (<input
                    type="checkbox"
                    bind:checked={formData.kensaChecks[
                      "kensa-血糖-空腹時-mark"
                    ]}
                    on:change={adaptChecks}
                  />
                  空腹時
                  <input
                    type="checkbox"
                    bind:checked={formData.kensaChecks["kensa-血糖-随時-mark"]}
                    on:change={adaptChecks}
                  />
                  随時
                  <span style="white-space:nowrap;"
                    ><input
                      type="checkbox"
                      bind:checked={formData.kensaChecks[
                        "kensa-血糖-食後-mark"
                      ]}
                      on:change={adaptChecks}
                    />
                    食後
                    <input
                      type="text"
                      style="width:2em"
                      bind:value={formData.immediates["kensa-血糖-食後"]}
                      on:change={adaptChecks}
                    /> 時間)</span
                  >
                  (<input
                    type="text"
                    style="width:4em;"
                    bind:value={formData.immediates["kensa-血糖-値"]}
                    on:change={adaptChecks}
                  /> mg/dl)
                </div>
                <span
                  ><input
                    type="checkbox"
                    bind:checked={formData.kensaChecks["kensa-HbA1c-mark"]}
                  />&nbsp;</span
                >
                <div>
                  HbA1c <input
                    type="text"
                    style="width:4em;"
                    bind:value={formData.immediates["kensa-HbA1c"]}
                    on:change={adaptChecks}
                  /> %
                </div>
              </div>
            </div>
            <div>
              <div
                style="display:grid;grid-template-columns:auto 1fr;row-gap:4px"
              >
                <span
                  ><input
                    type="checkbox"
                    bind:checked={formData.kensaChecks[
                      "kensa-総コレステロール-mark"
                    ]}
                  />&nbsp;</span
                >
                <div>
                  総コレステロール <input
                    type="text"
                    style="width:4em;"
                    bind:value={formData.immediates["kensa-総コレステロール"]}
                    on:change={adaptChecks}
                  /> mg/dl
                </div>
                <span
                  ><input
                    type="checkbox"
                    bind:checked={formData.kensaChecks["kensa-中性脂肪-mark"]}
                  />&nbsp;</span
                >
                <div>
                  中性脂肪 <input
                    type="text"
                    style="width:4em;"
                    bind:value={formData.immediates["kensa-中性脂肪"]}
                    on:change={adaptChecks}
                  /> mg/dl
                </div>
                <span
                  ><input
                    type="checkbox"
                    bind:checked={formData.kensaChecks[
                      "kensa-ＨＤＬコレステロール-mark"
                    ]}
                  />&nbsp;</span
                >
                <div>
                  HDLコレステロール <input
                    type="text"
                    style="width:4em;"
                    bind:value={formData.immediates[
                      "kensa-ＨＤＬコレステロール"
                    ]}
                    on:change={adaptChecks}
                  /> mg/dl
                </div>
                <span
                  ><input
                    type="checkbox"
                    bind:checked={formData.kensaChecks[
                      "kensa-ＬＤＬコレステロール-mark"
                    ]}
                  />&nbsp;</span
                >
                <div>
                  LDLコレステロール <input
                    type="text"
                    style="width:4em;"
                    bind:value={formData.immediates[
                      "kensa-ＬＤＬコレステロール"
                    ]}
                    on:change={adaptChecks}
                  /> mg/dl
                </div>
                <span
                  ><input
                    type="checkbox"
                    bind:checked={formData.kensaChecks[
                      "kensa-血液検査項目-その他-mark"
                    ]}
                  />&nbsp;</span
                >
                <div>
                  その他 <input
                    type="text"
                    style="width:14em;"
                    bind:value={formData.immediates[
                      "kensa-血液検査項目-その他"
                    ]}
                    on:change={adaptChecks}
                  />
                </div>
              </div>
            </div>
          </div>
          <div style="margin-left:2em;">
            <div>【その他】</div>
            <div>
              <input
                type="checkbox"
                bind:checked={formData.kensaChecks["kensa-栄養状態-mark"]}
              />
              栄養状態（
              <input
                type="checkbox"
                bind:checked={formData.kensaChecks[
                  "kensa-栄養状態-低栄養状態の恐れ"
                ]}
                on:change={adaptChecks}
              />
              低栄養状態の恐れ
              <input
                type="checkbox"
                bind:checked={formData.kensaChecks["kensa-栄養状態-良好"]}
                on:change={adaptChecks}
              />
              良好
              <input
                type="checkbox"
                bind:checked={formData.kensaChecks["kensa-栄養状態-肥満"]}
                on:change={adaptChecks}
              /> 肥満 ）
            </div>
            <div>
              <input
                type="checkbox"
                bind:checked={formData.kensaChecks["kensa-その他-その他-mark"]}
              />
              その他
              <input
                type="text"
                bind:value={formData.immediates["kensa-その他-その他"]}
                on:change={adaptChecks}
              />
            </div>
          </div>
        </div>
      {:else if formMode === "store"}
        <div>{store}</div>
      {/if}
    </div>
  </div>
  <div class="display-commands">
    <button on:click={doDisp}>表示</button>
  </div>
  <div>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="dev-menu">
      <span>Dev</span>
      <div
        class="chevrons"
        on:click={() => {
          showDev = !showDev;
        }}
      >
        {#if showDev}
          <ChevronUp />
        {:else}
          <ChevronDown />
        {/if}
      </div>
    </div>
    {#if showDev}
      <button on:click={doCreateForm}>Create Form</button>
    {/if}
  </div>
{/if}

<style>
  .form-area {
    margin: 10px 0;
  }

  .form-area-work {
    border: 1px solid gray;
    padding: 10px;
    width: 600px;
  }

  .form-area-work > div {
    margin: 4px 0;
  }

  .dev-menu {
    display: flex;
    align-items: center;
    color: gray;
  }

  .chevrons {
    display: inline-block;
    margin-left: 4px;
    position: relative;
    top: 3px;
  }

  .display-commands {
    margin: 10px 0;
  }
</style>
