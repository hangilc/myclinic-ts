<script lang="ts">
  import api from "@/lib/api";
  import type { Op } from "@/lib/drawer/compiler/op";
  import { drawShujii } from "@/lib/drawer/forms/shujii/shujii-drawer";
  import SearchPatientDialog from "@/lib/SearchPatientDialog.svelte";
  import type { Patient } from "myclinic-model";
  import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";
  import VisitsView from "@/lib/VisitsView.svelte";
  import { writable, type Writable } from "svelte/store";
  import { onDestroy } from "svelte";
  import type { ShujiiDrawerData } from "@/lib/drawer/forms/shujii/shujii-drawer-data";

  export let isVisible: boolean = false;
  let patient: Writable<Patient | undefined> = writable(undefined);
  let masterText = "";
  let dataMap: ShujiiDrawerData = {
    doctorName: "",
    clinicName: "",
    clinicAddress: "",
    phone: "",
    fax: "",
    detail: "",
  };

  loadClinicInfo();

  const unsubs = [
    patient.subscribe(async (patient) => {
      if (patient) {
      } else {
        masterText = "";
        dataMap.detail = "";
      }
    }),
  ];

  onDestroy(() => unsubs.forEach((f) => f()));

  async function loadClinicInfo() {
    const clinicInfo = await api.getClinicInfo();
    dataMap.doctorName = clinicInfo.doctorName;
    dataMap.clinicName = clinicInfo.name;
    dataMap.clinicAddress = clinicInfo.address;
    dataMap.phone = clinicInfo.tel;
    dataMap.fax = clinicInfo.fax;
  }

  async function initPatient(init: Patient) {
    $patient = init;
    masterText = await api.getShujiiMasterText(init.patientId);
    dataMap.detail = "";
  }

  function clearPatient() {
    $patient = undefined;
    masterText = "";
    dataMap.detail = "";
  }

  function doSelectPatient() {
    if (!$patient) {
      const d: SearchPatientDialog = new SearchPatientDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          title: "患者選択",
          onEnter: initPatient,
        },
      });
    } else {
      clearPatient();
    }
  }

  function doDisplay() {
    const ops = drawShujii(dataMap);
    const d: DrawerDialog = new DrawerDialog({
      target: document.body,
      props: {
        ops,
        destroy: () => d.$destroy(),
        width: 210 * 1.5,
        height: 297 * 1.5,
        viewBox: "0 0 210 297",
        scale: 1.5,
		kind: "shujii",
      },
    });
  }

  async function doSave() {
    if ($patient) {
      await api.saveShujiiMasterText($patient, masterText);
      console.log("master text saved");
    }
  }
</script>

{#if isVisible}
  <div class="wrapper">
    <div>
      <div class="title">主治医意見書</div>
      <div>
        <button on:click={doSelectPatient}>
          {#if !$patient}
            患者選択
          {:else}
            患者終了
          {/if}
        </button>
        <div>
          {#if $patient === undefined}
            （患者未選択）
          {:else}
            患者：({$patient.patientId}) {$patient.lastName}{$patient.firstName}
          {/if}
        </div>
        <div>
          <textarea class="master" bind:value={masterText} />
        </div>
        <div>
          <button on:click={doSave}>保存</button>
        </div>
      </div>
      <div class="data-input">
        <span>doctorName</span><input
          type="text"
          bind:value={dataMap["doctorName"]}
        />
        <span>clinicName</span><input
          type="text"
          bind:value={dataMap["clinicName"]}
        />
        <span>clinicAddress</span><input
          type="text"
          bind:value={dataMap["clinicAddress"]}
        />
        <span>phone</span><input type="text" bind:value={dataMap["phone"]} />
        <span>fax</span><input type="text" bind:value={dataMap["fax"]} />
        <span>detail</span><textarea
          bind:value={dataMap["detail"]}
          class="detail"
        />
      </div>
      <div>
        <button on:click={doDisplay}>表示</button>
      </div>
    </div>
    <div class="visit-view">
      <VisitsView {patient} />
    </div>
  </div>
{/if}

<style>
  .wrapper {
    display: grid;
    grid-template-columns: 1fr 400px;
    column-gap: 10px;
  }

  .title {
    font-size: 1.5rem;
    margin-bottom: 10px;
  }

  .data-input > span {
    display: block;
  }

  textarea.master {
    width: 720px;
    height: 300px;
  }

  textarea.detail {
    width: 640px;
    height: 120px;
  }
</style>
