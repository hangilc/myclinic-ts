<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import api from "@/lib/api";
  import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";
  import { drawRefer } from "@/lib/drawer/forms/refer/refer-drawer";
  import type { ClinicInfo, Patient } from "myclinic-model";
  import { DateWrapper } from "myclinic-util";
  import SearchPatientDialog from "@/lib/SearchPatientDialog.svelte";

  export let isVisible = false;
  let title = "紹介状";
  let referHospital = "";
  let referDoctor = "";
  let patientName = "";
  let patientInfo = "";
  let diagnosis = "";
  let content = "";
  let issueDate = "";
  let address = "";
  let clinicName = "";
  let issuerDoctorName = "";
  let patient: Patient | undefined = undefined;
  let clinicInfo: ClinicInfo | undefined = undefined;

  loadClinicInfo();
  initIssueDate();

  function initIssueDate() {
    const today = DateWrapper.from(new Date());
    issueDate = `${today.getGengou()}${today.getNen()}年${today.getMonth()}月${today.getDay()}日`;
  }

  async function loadClinicInfo() {
    if( !clinicInfo ){
      clinicInfo = await api.getClinicInfo();
    }
    const cl = clinicInfo;
    address = `${cl.postalCode}\n${cl.address}\n電話 ${cl.tel}\nＦＡＸ ${cl.fax}`;
    clinicName = cl.name;
    issuerDoctorName = cl.doctorName;
  }

  function initWithPatient(p: Patient) {
    patient = p;
    patientName = `患者：${p.lastName}${p.firstName}`;
    const bd = DateWrapper.from(p.birthday);
    const sex = p.sex === "M" ? "男" : "女";
    patientInfo = `${bd.getGengou()}${bd.getNen()}年${bd.getMonth()}月${bd.getDay()}日生、${bd.getAge()}才、${sex}性`;
  }

  function doView() {
    let referDoctorValue: string = referDoctor.trim();
    if (referDoctorValue === "") {
      referDoctorValue = "                      ";
    }
    referDoctorValue += " 先生御机下";
    let data = {
      title,
      "refer-hospital": referHospital,
      "refer-doctor": referDoctorValue,
      "patient-name": patientName,
      "patient-info": patientInfo,
      diagnosis,
      content,
      "issue-date": issueDate,
      address,
      "clinic-name": clinicName,
      "issuer-doctor-name": issuerDoctorName,
    };

    let pages = drawRefer(data);
    const d: DrawerDialog = new DrawerDialog({
      target: document.body,
      props: {
        pages,
        kind: "refer",
        destroy: () => d.$destroy(),
        scale: 2,
      },
    });
  }

  function doSelectPatient() {
    const d: SearchPatientDialog = new SearchPatientDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "患者選択",
        onEnter: initWithPatient,
      },
    });
  }

  function doClearPatient() {
    patient = undefined;
    title = "紹介状";
    referHospital = "";
    referDoctor = "";
    patientName = "";
    patientInfo = "";
    diagnosis = "";
    content = "";
    initIssueDate();
    loadClinicInfo();
  }
</script>

{#if isVisible}
  <ServiceHeader title="紹介状" />
  <div style="margin: 10px 0;">
    {#if patient === undefined}
      <button on:click={doSelectPatient}>患者選択</button>
    {:else}
      <button on:click={doClearPatient}>患者終了</button>
    {/if}
    {#if patient}
    <div style="margin-top: 4px;">
      ({patient.patientId}) {patient.lastName} {patient.firstName} 
    </div>
    {/if}
  </div>
  <div style="display:grid; grid-template-columns:auto 1fr;gap: 4px;">
    <span>表題：</span>
    <input type="text" bind:value={title} style="width: 6em;" />
    <span>医療機関</span>
    <input type="text" bind:value={referHospital} style="width: 16em;" />
    <span>医師</span>
    <div>
      <input type="text" bind:value={referDoctor} style="width: 16em;" /> 先生御机下
    </div>
    <span>患者氏名</span>
    <input type="text" bind:value={patientName} style="width: 16em;" />
    <span>患者情報</span>
    <input type="text" bind:value={patientInfo} style="width: 16em;" />
    <span>診断</span>
    <input type="text" bind:value={diagnosis} style="width: 16em;" />
    <span>内容</span>
    <textarea bind:value={content} style="width: 26em;height: 10em;" />
    <span>発行日</span>
    <input type="text" bind:value={issueDate} style="width: 16em;" />
    <span>住所</span>
    <textarea
      bind:value={address}
      style="width: 18em;height:5.5em;resize:vertical"
    />
    <span>発行機関</span>
    <input type="text" bind:value={clinicName} style="width: 16em;" />
    <span>発行医師</span>
    <input type="text" bind:value={issuerDoctorName} style="width: 16em;" />
  </div>
  <button on:click={doView}>表示</button>
{/if}
