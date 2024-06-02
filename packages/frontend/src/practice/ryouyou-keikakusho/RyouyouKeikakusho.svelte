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
  import Form from "./Form.svelte";
  import type { Store } from "./store";
  import { DateWrapper, calcAge, sqlDateToObject } from "myclinic-util";
  import { KanjiDate } from "kanjidate";
  import { sqlDateToDate } from "@/lib/date-util";
  import { dateToSql } from "@/lib/util";
  import { mkFormData, type FormData } from "./form-data";

  export let isVisible = false;
  let showDev = false;
  let patient: Patient | undefined = undefined;
  let formMode: "input" | "store" = "input";
  let formData: FormData = mkFormData();
  let ryouyouKeikakushoData: RyouyouKeikakushoData = mkRyouyouKeikakushoData();
  let store: string = "";
  let clinicInfo: ClinicInfo | undefined = undefined;
  // let diseaseDiabetes = false;
  // let diseaseHypertension = true;
  // let diseaseHyperLipidemia = false;
  let formAreaWork: HTMLElement;
  let juutenShokujiChecked = false;
  const shokujiItems = [
    ["juuten-食事-摂取量を適正にする-mark", "摂取量を適正にする"],
    ["juuten-食事-食塩・調味料を控える-mark", "食塩・調味料を控える"],
    ["juuten-食事-食物繊維の摂取を増やす-mark", "食物繊維の摂取を増やす"],
    [
      "juuten-食事-外食の際の注意事項-mark",
      "外食の際の注意事項",
      "juuten-食事-外食の際の注意事項",
    ],
    [
      "juuten-食事-油を使った料理の摂取を減らす-mark",
      "油を使った料理の摂取を減らす",
    ],
    ["juuten-食事-その他-mark", "その他"],
    ["juuten-食事-節酒-mark", "節酒"],
    ["juuten-食事-間食-mark", "間食"],
    ["juuten-食事-食べ方-mark", "食べ方"],
    ["juuten-食事-食事時間-mark", "食事時間"],
  ] as const;

  $: formData.shokujiCheck = calcCheck(formData.shokujiCheck, [
    ...Object.values(formData.shokujiChecks),
    formData.immediates["juuten-食事-外食の際の注意事項"] !== "",
    formData.immediates["juuten-食事-節酒"] !== "",
    formData.immediates["juuten-食事-節酒-回"] !== "",
    formData.immediates["juuten-食事-間食"] !== "",
    formData.immediates["juuten-食事-間食-回"] !== "",
    formData.shokujiYukkuri,
    formData.immediates["juuten-食事-食べ方"] !== "",
  ]);

  function calcCheck(shokujiCheck: boolean, values: boolean[]): boolean {
    return shokujiCheck || values.some((b) => b);
  }

  $: formData.shokujiChecks["juuten-食事-外食の際の注意事項-mark"] =
    formData.shokujiChecks["juuten-食事-外食の際の注意事項-mark"] ||
    formData.immediates["juuten-食事-外食の際の注意事項"] !== "";

  $: formData.shokujiChecks["juuten-食事-節酒-mark"] =
    formData.shokujiChecks["juuten-食事-節酒-mark"] ||
    formData.immediates["juuten-食事-節酒"] !== "" ||
    formData.immediates["juuten-食事-節酒-回"] !== "";

  $: formData.shokujiChecks["juuten-食事-間食-mark"] =
    formData.shokujiChecks["juuten-食事-間食-mark"] ||
    formData.immediates["juuten-食事-間食"] !== "" ||
    formData.immediates["juuten-食事-間食-回"] !== "";

  $: formData.shokujiChecks["juuten-食事-食べ方-mark"] =
    formData.shokujiChecks["juuten-食事-食べ方-mark"] ||
    formData.shokujiYukkuri ||
    formData.immediates["juuten-食事-食べ方"] !== "";

  $: formData.undouCheck = calcCheck(formData.undouCheck, [
    ...Object.values(formData.undouChecks),
    formData.immediates["juuten-運動-種類"] !== "",
    formData.immediates["juuten-運動-時間"] !== "",
    formData.undouEveryDay,
    formData.immediates["juuten-運動-頻度"] !== "",
    formData.undouIntensityBreath,
    formData.immediates["juuten-運動-強度-脈拍"] !== "",
    formData.immediates["juuten-運動-強度-その他"] !== "",
    formData.immediates["juuten-運動-活動量"] !== "",
    formData.immediates["juuten-運動-注意事項"] !== "",
  ]);

  $: formData.undouChecks["juuten-運動-種類-mark"] =
    formData.undouChecks["juuten-運動-種類-mark"] ||
    formData.immediates["juuten-運動-種類"] !== "" ||
    formData.immediates["juuten-運動-時間"] !== "" ||
    formData.undouEveryDay ||
    formData.immediates["juuten-運動-頻度"] !== "" ||
    formData.undouIntensityBreath ||
    formData.immediates["juuten-運動-強度-脈拍"] !== "" ||
    formData.immediates["juuten-運動-強度-その他"] !== "";

  $: formData.undouChecks["juuten-運動-活動量-mark"] =
    formData.undouChecks["juuten-運動-活動量-mark"] ||
    formData.immediates["juuten-運動-活動量"] !== "";

  $: formData.undouChecks["juuten-運動-注意事項-mark"] =
    formData.undouChecks["juuten-運動-注意事項-mark"] ||
    formData.immediates["juuten-運動-注意事項"] !== "";

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
    updateBox("juuten-運動-mark", formData.undouCheck);
  }

  function initStore() {
    store = `
  {
      "issueDate": "2024-06-01",
      "diseases": ["diabetes", "hypertension", "hyperlipidemia"],
      "targetBodyWeight": "75",
      "targetBMI": "22.0",
      "targetBloodPressure": "130/80",
      "targetHbA1c": "7.0",
      "achievementTarget": "達成目標の内容",
      "behaviorTarget": "行動目標の内容",
      "immediates": {
        "juuten-食事-mark": "1",
        "juuten-運動-mark": "1"
      }
    } `;
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
  }

  function doDisp() {
    populateWithIssueDate();
    populateWithPatient();
    populateDiseases();
    populateMokuhyou();
    populateShokuji();
    populateUndou();
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

  function doStoreToForm() {
    let s = store;
    if (s === "") {
      s = "{}";
    }
    ryouyouKeikakushoData = mkRyouyouKeikakushoData();
    const storeValue: Partial<Store> = JSON.parse(s);
    if (storeValue.issueDate) {
      const d = sqlDateToObject(storeValue.issueDate);
      ryouyouKeikakushoData["issue-year"] = d.year.toString();
      ryouyouKeikakushoData["issue-month"] = d.month.toString();
      ryouyouKeikakushoData["issue-day"] = d.day.toString();
    }
    if (patient) {
      ryouyouKeikakushoData["patient-name"] =
        `${patient.lastName}${patient.firstName}`;
      switch (patient.sex) {
        case "M": {
          ryouyouKeikakushoData["patient-sex-male"] = "1";
          break;
        }
        case "F": {
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
      const age = calcAge(patient.birthday, new Date());
      ryouyouKeikakushoData["patient-age"] = age.toString();
    }
    if (storeValue.diseases) {
      storeValue.diseases.forEach(
        (disease) => (ryouyouKeikakushoData[`disease-${disease}`] = "1")
      );
    }
    if (storeValue.targetBodyWeight) {
      ryouyouKeikakushoData["mokuhyou-体重-mark"] = "1";
      ryouyouKeikakushoData["mokuhyou-体重"] = storeValue.targetBodyWeight;
    }
    if (storeValue.targetBMI) {
      ryouyouKeikakushoData["mokuhyou-BMI-mark"] = "1";
      ryouyouKeikakushoData["mokuhyou-BMI"] = storeValue.targetBMI;
    }
    if (storeValue.targetBloodPressure) {
      ryouyouKeikakushoData["mokuhyou-BP-mark"] = "1";
      ryouyouKeikakushoData["mokuhyou-BP"] = storeValue.targetBloodPressure;
    }
    if (storeValue.targetHbA1c) {
      ryouyouKeikakushoData["mokuhyou-HbA1c-mark"] = "1";
      ryouyouKeikakushoData["mokuhyou-HbA1c"] = storeValue.targetHbA1c;
    }
    if (storeValue.achievementTarget) {
      ryouyouKeikakushoData["mokuhyou-達成目標"] = storeValue.achievementTarget;
    }
    if (storeValue.behaviorTarget) {
      ryouyouKeikakushoData["mokuhyou-行動目標"] = storeValue.behaviorTarget;
    }
    if (storeValue.immediates) {
      for (let key in storeValue.immediates) {
        const value = storeValue.immediates[key];
        // @ts-ignore
        ryouyouKeikakushoData[key] = value;
      }
    }
    if (clinicInfo) {
      ryouyouKeikakushoData["医師氏名"] = clinicInfo.doctorName;
    }
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
          break;
        }
        case "F": {
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
      ryouyouKeikakushoData["patient-sex-male"] = "1";
      ryouyouKeikakushoData["patient-sex-female"] = "";
      ryouyouKeikakushoData["birthdate-gengou-meiji"] = "";
      ryouyouKeikakushoData["birthdate-gengou-taishou"] = "";
      ryouyouKeikakushoData["birthdate-gengou-shouwa"] = "1";
      ryouyouKeikakushoData["birthdate-gengou-heisei"] = "1";
      ryouyouKeikakushoData["birthdate-gengou-reiwa"] = "";
      ryouyouKeikakushoData["birthdate-nen"] = "";
      ryouyouKeikakushoData["birthdate-month"] = "";
      ryouyouKeikakushoData["birthdate-day"] = "";
      ryouyouKeikakushoData["patient-age"] = "";
    }
  }

  function castToInput(e: Element | null): HTMLInputElement {
    return e as HTMLInputElement;
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
          />
          糖尿病
          <input type="checkbox" bind:checked={formData.diseaseHypertension} />
          高血圧
          <input
            type="checkbox"
            bind:checked={formData.diseaseHyperlipidemia}
          /> 高脂血症
        </div>
        <div>
          <span>【目標】</span>
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
        </div>
        <div style="display: flex; align-items:top">
          【達成目標】
          <textarea
            style="width: 400px; height: 2.8em; resize: vertical"
            bind:value={formData.immediates["mokuhyou-達成目標"]}
          />
        </div>
        <div style="display: flex; align-items:top">
          【行動目標】
          <textarea
            style="width: 400px; height: 2.8em; resize: vertical"
            bind:value={formData.immediates["mokuhyou-行動目標"]}
          />
        </div>
        <div>
          【<input bind:checked={formData.shokujiCheck} type="checkbox" />食事】
          <div style="margin-left: 2em">
            <div>
              <input
                type="checkbox"
                bind:checked={formData.shokujiChecks[
                  "juuten-食事-摂取量を適正にする-mark"
                ]}
              /> 摂取量を適正にする
            </div>
            <div>
              <input
                type="checkbox"
                bind:checked={formData.shokujiChecks[
                  "juuten-食事-食塩・調味料を控える-mark"
                ]}
              /> 食塩・調味料を控える
            </div>
            <div>
              <input
                type="checkbox"
                bind:checked={formData.shokujiChecks[
                  "juuten-食事-食物繊維の摂取を増やす-mark"
                ]}
              /> 食物繊維の摂取を増やす
            </div>
            <div>
              <input
                type="checkbox"
                bind:checked={formData.shokujiChecks[
                  "juuten-食事-外食の際の注意事項-mark"
                ]}
              />
              外食の際の注意事項
              <input
                type="text"
                bind:value={formData.immediates[
                  "juuten-食事-外食の際の注意事項"
                ]}
              />
            </div>
            <div>
              <input
                type="checkbox"
                bind:checked={formData.shokujiChecks[
                  "juuten-食事-油を使った料理の摂取を減らす-mark"
                ]}
              /> 油を使った料理の摂取を減らす
            </div>
            <div>
              <input
                type="checkbox"
                bind:checked={formData.shokujiChecks["juuten-食事-その他-mark"]}
              /> その他
            </div>
            <div>
              <input
                type="checkbox"
                bind:checked={formData.shokujiChecks["juuten-食事-節酒-mark"]}
              />
              節酒
              <input
                type="text"
                bind:value={formData.immediates["juuten-食事-節酒"]}
              />
              を週
              <input
                type="text"
                bind:value={formData.immediates["juuten-食事-節酒-回"]}
                style="width: 4em"
              /> 回
            </div>
            <div>
              <input
                type="checkbox"
                bind:checked={formData.shokujiChecks["juuten-食事-間食-mark"]}
              />
              間食
              <input
                type="text"
                bind:value={formData.immediates["juuten-食事-間食"]}
              />
              を週
              <input
                type="text"
                bind:value={formData.immediates["juuten-食事-間食-回"]}
                style="width: 4em"
              /> 回
            </div>
            <div>
              <input
                type="checkbox"
                bind:checked={formData.shokujiChecks["juuten-食事-食べ方-mark"]}
              />
              食べ方
              <input type="checkbox" bind:checked={formData.shokujiYukkuri} />
              ゆっくり食べる
              <input
                type="text"
                bind:value={formData.immediates["juuten-食事-食べ方"]}
              />
            </div>
            <div>
              <input
                type="checkbox"
                bind:checked={formData.shokujiChecks[
                  "juuten-食事-食事時間-mark"
                ]}
              /> 食事時間
            </div>
          </div>
        </div>
        <div>
          【<input bind:checked={formData.undouCheck} type="checkbox" />運動】
          <div
            style="display:grid;grid-template-columns:auto 1fr;margin-left:2em;"
          >
            <span style="flex-basis:auto;flex-shrink:0"
              ><input
                type="checkbox"
                bind:checked={formData.undouChecks["juuten-運動-種類-mark"]}
              />&nbsp;</span
            >
            <div style="flex-grow:1">
              <div>
                運動処方・種類
                <input
                  type="text"
                  bind:value={formData.immediates["juuten-運動-種類"]}
                />
              </div>
              <div>
                時間（３０分以上 <input
                  type="text"
                  bind:value={formData.immediates["juuten-運動-時間"]}
                />）
              </div>
              <div>
                頻度<input
                  type="checkbox"
                  bind:checked={formData.undouEveryDay}
                />
                ほぼ毎日、 週
                <input
                  type="text"
                  style="width:4em"
                  bind:value={formData.immediates["juuten-運動-頻度"]}
                /> 日
              </div>
              <div style="display:flex;align-items:top">
                <span style="flex-basis:auto;flex-shrink:0">強度</span>
                <div style="flex-grow:1">
                  <input
                    type="checkbox"
                    bind:checked={formData.undouIntensityBreath}
                  />
                  息がはずむが会話が可能な強さ or
                  <input
                    type="text"
                    style="width:4em"
                    bind:value={formData.immediates["juuten-運動-強度-脈拍"]}
                  />
                  拍／分 or
                  <input
                    type="text"
                    bind:value={formData.immediates["juuten-運動-強度-その他"]}
                  />
                </div>
              </div>
            </div>
            <span style="flex-basis:auto;flex-shrink:0"
              ><input
                type="checkbox"
                bind:checked={formData.undouChecks["juuten-運動-活動量-mark"]}
              />&nbsp;</span
            >
            <div>
              日常生活の活動量増加 <input
                type="text"
                bind:value={formData.immediates["juuten-運動-活動量"]}
              />
            </div>
            <span style="flex-basis:auto;flex-shrink:0"
              ><input
                type="checkbox"
                bind:checked={formData.undouChecks["juuten-運動-注意事項-mark"]}
              />&nbsp;</span
            >
            <div>
              運動時の注意事項など
              <input
                type="text"
                bind:value={formData.immediates["juuten-運動-注意事項"]}
              />
            </div>
          </div>
        </div>
      {:else if formMode === "store"}
        <div>{store}</div>
      {/if}
    </div>
  </div>
  <div class="store-form-commands">
    <button on:click={doStoreToForm}>Store to Form</button>
  </div>
  <div class="data-area">
    <textarea bind:value={store} />
  </div>
  <div class="form-inputs">
    <Form bind:ryouyouKeikakushoData />
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

  .form-inputs {
    max-height: 300px;
    overflow: auto;
    margin: 10px 0;
    border: 1px solid gray;
    padding: 10px;
    width: 600px;
    resize: vertical;
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

  .data-area textarea {
    width: 600px;
    height: 300px;
    resize: vertical;
  }

  .display-commands,
  .store-form-commands {
    margin: 10px 0;
  }
</style>
