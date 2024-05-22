<script lang="ts">
  import { patientDeleted } from "@/app-events";
  import api from "@/lib/api";
  import type { Op } from "@/lib/drawer/compiler/op";
  import { drawShujii } from "@/lib/drawer/forms/shujii/shujii-drawer";
  import SearchPatientDialog from "@/lib/SearchPatientDialog.svelte";
  import type { Patient } from "myclinic-model";

  export let isVisible: boolean = false;
  let patient: Patient | undefined = undefined;
  let masterText = "";
  let dataMap: ShujiiDrawerData = {
    doctorName: "",
    clinicName: "",
    clinicAddress: "",
    phone: "",
    fax: "",
    detail: "",
  };
  let ops: Op[] = drawShujii(dataMap);

  loadClinicInfo();

  async function loadClinicInfo() {
    const clinicInfo = await api.getClinicInfo();
    dataMap.doctorName = clinicInfo.doctorName;
    dataMap.clinicName = clinicInfo.name;
    dataMap.clinicAddress = clinicInfo.address;
    dataMap.phone = clinicInfo.tel;
    dataMap.fax = clinicInfo.fax;
    ops = drawShujii(dataMap);
  }

  async function initPatient(init: Patient) {
    patient = init;
    masterText = await api.getShujiiMasterText(init);
  }

  function doSelectPatient() {
    const d: SearchPatientDialog = new SearchPatientDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "患者選択",
        onEnter: initPatient,
      }
    })
  }
</script>

{#if isVisible}
  <div class="title">主治医意見書</div>
  <div>
    <button on:click={doSelectPatient}>患者選択</button>
    <div>
      {#if patient === undefined}
        （患者未選択）
      {:else}
        患者：(Patient.patientId) {patient.lastName}{patient.firstName}
      {/if}
    </div>
    <div>
      <textarea bind:value={masterText} />
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
    <span>detail</span><input type="text" bind:value={dataMap["detail"]} />
  </div>
{/if}

<style>
  .title {
    font-size: 1.5rem;
    margin-bottom: 10px;
  }

  .data-input > span {
    display: block;
  }
</style>
