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

  export let isVisible = false;
  let showDev = false;
  let patient: Patient | undefined = undefined;
  let formMode: "input" | "store" = "input";
  let mode: "shokai" | "keizoku" = "shokai";
  let issueDate: string = dateToSql(new Date());
  let ryouyouKeikakushoData: RyouyouKeikakushoData = mkRyouyouKeikakushoData();
  let store: string = "";
  let clinicInfo: ClinicInfo | undefined = undefined;
  let diseaseDiabetes = false;
  let diseaseHypertension = true;
  let diseaseHyperLipidemia = false;
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

  $: updateBox("juuten-食事-mark", juutenShokujiChecked);

  init();

  async function init() {
    clinicInfo = await api.getClinicInfo();
    onIssueDateChange();
    updateDiseases();
  }

  function updateBox(key: keyof RyouyouKeikakushoData, checked: boolean) {
    updateValue(key, checked ? "1" : "");
  }

  function updateValue(key: keyof RyouyouKeikakushoData, value: string) {
    ryouyouKeikakushoData[key] = value;
  }

  function updateDiseases() {
    updateBox("disease-diabetes", diseaseDiabetes);
    updateBox("disease-hypertension", diseaseHypertension);
    updateBox("disease-hyperlipidemia", diseaseHyperLipidemia);
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
          onPatientChange();
        },
      },
    });
  }

  function doClearPatient() {
    patient = undefined;
  }

  function doDisp() {
    let ops: Op[];
    if (mode === "shokai") {
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
      let s = {
        mode,
      };
      store = JSON.stringify(s, undefined, 2);
    }
  }

  function onIssueDateChange() {
    if (issueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const d = DateWrapper.from(issueDate);
      ryouyouKeikakushoData["issue-year"] = d.getYear().toString();
      ryouyouKeikakushoData["issue-month"] = d.getMonth().toString();
      ryouyouKeikakushoData["issue-day"] = d.getDay().toString();
    } else {
      ryouyouKeikakushoData["issue-year"] = "";
      ryouyouKeikakushoData["issue-month"] = "";
      ryouyouKeikakushoData["issue-day"] = "";
    }
  }

  function onPatientChange() {
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
      const age = calcAge(patient.birthday, issueDate ?? new Date());
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
          <input type="radio" value="shokai" bind:group={mode} /> 初回
          <input type="radio" value="keizoku" bind:group={mode} /> 継続
        </div>
        <div>
          発行日：<input
            type="text"
            bind:value={issueDate}
            on:change={onIssueDateChange}
          />
        </div>
        <div>
          主病：<input
            type="checkbox"
            bind:checked={diseaseDiabetes}
            on:change={updateDiseases}
          />
          糖尿病
          <input
            type="checkbox"
            bind:checked={diseaseHypertension}
            on:change={updateDiseases}
          />
          高血圧
          <input
            type="checkbox"
            bind:checked={diseaseHyperLipidemia}
            on:change={updateDiseases}
          /> 高脂血症
        </div>
        <div>
          <span>【目標】</span>
          体重：<input
            type="text"
            style:width="6em"
            on:change={(event) => {
              const value = event.currentTarget.value;
              updateBox("mokuhyou-体重-mark", value !== "");
              updateValue("mokuhyou-体重", value);
            }}
          />
          kg BMI：<input
            type="text"
            style:width="6em"
            on:change={(event) => {
              const value = event.currentTarget.value;
              updateBox("mokuhyou-BMI-mark", value !== "");
              updateValue("mokuhyou-BMI", value);
            }}
          />
          血圧：<input
            type="text"
            style:width="6em"
            on:change={(event) => {
              const value = event.currentTarget.value;
              updateBox("mokuhyou-BP-mark", value !== "");
              updateValue("mokuhyou-BP", value);
            }}
          />
          <span style="white-space:nowrap">
            HbA1c：<input
              type="text"
              style:width="6em"
              on:change={(event) => {
                const value = event.currentTarget.value;
                updateBox("mokuhyou-HbA1c-mark", value !== "");
                updateValue("mokuhyou-HbA1c", value);
              }}
            />
          </span>
        </div>
        <div style="display: flex; align-items:top">
          【達成目標】
          <textarea
            style="width: 400px; height: 2.8em; resize: vertical"
            on:change={(event) => {
              updateValue("mokuhyou-達成目標", event.currentTarget.value);
            }}
          />
        </div>
        <div style="display: flex; align-items:top">
          【行動目標】
          <textarea
            style="width: 400px; height: 2.8em; resize: vertical"
            on:change={(event) => {
              updateValue("mokuhyou-行動目標", event.currentTarget.value);
            }}
          />
        </div>
        <div>
          【<input bind:checked={juutenShokujiChecked} type="checkbox" />食事】
          <div style="margin-left: 2em">
            {#each shokujiItems as item}
              <div>
                <input
                  type="checkbox"
                  class={item[0]}
                  on:change={(event) => {
                    const checked = event.currentTarget.checked;
                    if (checked) {
                      juutenShokujiChecked = true;
                    }
                    updateBox(item[0], event.currentTarget.checked);
                  }}
                />
                {item[1]}
                {#if item[2]}
                  <div style="margin-left: 2em;">
                    <input
                      type="text"
                      on:change={(event) => {
                        if (item[2] !== undefined) {
                          const text = event.currentTarget.value;
                          updateValue(item[2], text);
                          if (text !== "") {
                            const input = castToInput(
                              formAreaWork.querySelector(`.${item[0]}`)
                            );
                            const checkbox = castToInput(input);
                            if (!checkbox.checked) {
                              checkbox.click();
                            }
                          }
                        }
                      }}
                    />
                  </div>
                {/if}
              </div>
            {/each}
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
