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
  import { calcAge, sqlDateToObject } from "myclinic-util";
  import { KanjiDate } from "kanjidate";
  import { sqlDateToDate } from "@/lib/date-util";

  export let isVisible = false;
  let showDev = false;
  let patient: Patient | undefined = undefined;
  let mode: "shokai" | "keizoku" = "shokai";
  let ryouyouKeikakushoData: RyouyouKeikakushoData = mkRyouyouKeikakushoData();
  let store: string = "";
  let clinicInfo: ClinicInfo | undefined = undefined;

  init();

  async function init() {
    clinicInfo = await api.getClinicInfo();
  }

  async function test() {
    const text = await api.getRyouyouKeikakushoMasterText(198);
    console.log(text);
    await api.saveRyouyouKeikakushoMasterText(198, "[1234]");
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
          doPatientUpdate(patient);
        },
      },
    });
  }

  function doPatientUpdate(p: Patient) {
    patient = p;
    initStore();
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
  <div>
    <input type="radio" value="shokai" bind:group={mode} />
    初回
    <input type="radio" value="keizoku" bind:group={mode} /> 継続
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
