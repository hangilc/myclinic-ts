<script lang="ts">
  import DrawerSvg from "@/lib/drawer/DrawerSvg.svelte";
  import type { Op } from "@/lib/drawer/compiler/op";
  import { drawRyouyouKeikakushoShokai } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-shokai-drawer";
  import { drawRyouyouKeikakushoKeizoku } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-keizoku-drawer";
  import ShokaiForm from "./ShokaiForm.svelte";
  import {
    mkRyouyouKeikakushoData,
    type RyouyouKeikakushoData,
  } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-data";
  import KeizokuForm from "./KeizokuForm.svelte";
  import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";
  import api from "@/lib/api";
  import type { Patient } from "myclinic-model";
  import SearchPatientDialog from "@/lib/SearchPatientDialog.svelte";
  import { createInputs } from "@/lib/drawer/forms/ryouyou-keikakusho/meta";
  import ChevronDown from "@/icons/ChevronDown.svelte";
  import ChevronUp from "@/icons/ChevronUp.svelte";
  import Form from "./Form.svelte";

  // import {
  //   createDataMap,
  //   createInterface,
  //   createKeizokuInputs,
  //   createShokaiInputs,
  // } from "@/lib/drawer/forms/ryouyou-keikakusho/meta";

  // console.log(createInterface());
  // console.log(createDataMap());
  // console.log(createShokaiInputs());
  // console.log(createKeizokuInputs());

  export let isVisible = false;
  let showDev = false;
  let patient: Patient | undefined = undefined;
  let mode: "shokai" | "keizoku" = "shokai";
  let ryouyouKeikakushoData: RyouyouKeikakushoData = mkRyouyouKeikakushoData();

  async function test() {
    const text = await api.getRyouyouKeikakushoMasterText(198);
    console.log(text);
    await api.saveRyouyouKeikakushoMasterText(198, "[1234]");
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
  <div class="form-inputs">
    <Form bind:ryouyouKeikakushoData />
  </div>
  <div>
    <button on:click={doDisp}>表示</button>
  </div>
  <div>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="dev-menu">
      <span>Dev</span><div class="chevrons"
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
</style>
