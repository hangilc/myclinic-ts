<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";
  import {
    drawShindansho,
    mkShindanshoDrawerData,
    type ShindanshoDrawerData,
  } from "@/lib/drawer/forms/shindansho/shindansho-drawer";
  import SearchPatientDialog from "@/lib/SearchPatientDialog.svelte";
  import type { ClinicInfo, Patient } from "myclinic-model";
  import { DateWrapper } from "myclinic-util";
  import api from "@/lib/api";

  let data: ShindanshoDrawerData = mkShindanshoDrawerData();
  let patient: Patient | undefined = undefined;
  let clinicInfo: ClinicInfo | undefined = undefined;

  initClinicInfo();

  async function initClinicInfo() {
    if (!clinicInfo) {
      clinicInfo = await api.getClinicInfo();
      setClinicInfo();
    }
  }

  function setClinicInfo() {
    if (clinicInfo) {
      const cl = clinicInfo;
      data = Object.assign(data, {
        "postal-code": cl.postalCode,
        address: cl.address,
        phone: `Tel: ${cl.tel}`,
        fax: `Fax: ${cl.fax}`,
        "clinic-name": cl.name,
        "doctor-name": cl.doctorName,
      });
    }
  }

  function doView() {
    let ops = drawShindansho(data);
    const d: DrawerDialog = new DrawerDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        ops: ops,
        scale: 2,
      },
    });
  }

  function initPatient(p: Patient) {
    patient = p;
    const bd = DateWrapper.from(p.birthday);
    data = Object.assign(mkShindanshoDrawerData(), {
      "patient-name": `${p.lastName} ${p.firstName}`,
      "birth-date": `${bd.getGengou()}${bd.getNen()}年${bd.getMonth()}月${bd.getDay()}日生`,
    });
  }

  function doSelectPatient() {
    const d: SearchPatientDialog = new SearchPatientDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "患者選択",
        onEnter: initPatient,
      },
    });
  }

  function doClear() {
    patient = undefined;
    data = mkShindanshoDrawerData();
  }
</script>

<ServiceHeader title="診断書" />
<div style="margin:10px 0;">
  <button on:click={doSelectPatient}>患者選択</button>
  <a href="javascript:void(0)" on:click={doClear}>Clear</a>
  <div style="margin-top: 10px;">
    {#if patient === undefined}
      （患者未選択）
    {:else}
      患者：({patient.patientId}) {patient.lastName}{patient.firstName}
    {/if}
  </div>
</div>
<div style="display:grid;grid-template-columns:max-content 16em;gap:4px;">
  <span>patient-name</span>
  <input type="text" bind:value={data["patient-name"]} />
  <span>birth-date</span>
  <input type="text" bind:value={data["birth-date"]} />
  <span>diagnosis</span>
  <input type="text" bind:value={data["diagnosis"]} />
  <span>text</span>
  <textarea
    bind:value={data["text"]}
    style="width: 26em;height:4em;resize:vertical;"
  />
  <span>issue-date</span>
  <input type="text" bind:value={data["issue-date"]} />
  <span>postal-code</span>
  <input type="text" bind:value={data["postal-code"]} />
  <span>address</span>
  <input type="text" bind:value={data["address"]} />
  <span>phone</span>
  <input type="text" bind:value={data["phone"]} />
  <span>fax</span>
  <input type="text" bind:value={data["fax"]} />
  <span>clinic-name</span>
  <input type="text" bind:value={data["clinic-name"]} />
  <span>doctor-name</span>
  <input type="text" bind:value={data["doctor-name"]} />
</div>
<div>
  <button on:click={doView}>表示</button>
</div>
