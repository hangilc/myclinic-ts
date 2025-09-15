<script lang="ts">
  import {
    drawRyouyouhiDouisho,
    mkRyouyouhiDouishoDrawerData,
    type RyouyouhiDouishoDrawerData,
  } from "@/lib/drawer/forms/ryouyouhi-douisho/ryouyouhi-douisho-drawer";
  import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";
  import TextField from "@/practice/ryouyouhi-douisho/components/TextField.svelte";
  import SearchPatientDialog from "@/lib/SearchPatientDialog.svelte";
  import type { Patient, ClinicInfo } from "myclinic-model";
  import { DateWrapper } from "myclinic-util";
  import api from "@/lib/api";
  import ConsentTypeField from "./components/ConsentTypeField.svelte";
  import SymptomWeaknessField from "./components/SymptomWeaknessField.svelte";
  import SymptomContractureField from "./components/SymptomContractureField.svelte";
  import TreatmentField from "./components/TreatmentField.svelte";
  import HouseVisitField from "./components/HouseVisitField.svelte";

  export let isVisible: boolean;
  let data: RyouyouhiDouishoDrawerData = mkRyouyouhiDouishoDrawerData();
  setupData(data);
  setupClinicData();
  
  function setupData(data: RyouyouhiDouishoDrawerData) {
    data["condition-name"] = "筋麻痺、筋委縮、関節拘縮";
    data["consent-type"] = "初回の同意";
  }

  async function setupClinicData() {
    const clinicInfo: ClinicInfo = await api.getClinicInfo();
    data["clinic-name"] = clinicInfo.name;
    data["clinic-address"] = clinicInfo.address;
    data["doctor-name"] = clinicInfo.doctorName;

    // Set today's date for issue-date and examination-date
    const today = DateWrapper.from(new Date());
    data["issue-date"] = today.format1();
    data["examination-date"] = today.format1();
  }

  function doPrint() {
    let ops = drawRyouyouhiDouisho(data);
    const d: DrawerDialog = new DrawerDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        ops,
        scale: 2,
      },
    });
  }

  async function doSelectPatient() {
    const d: SearchPatientDialog = new SearchPatientDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "患者選択",
        onEnter: (patient: Patient) => {
          setPatientData(patient);
        },
      },
    });
  }

  async function setPatientData(patient: Patient) {
    const bd = DateWrapper.from(patient.birthday);
    data["patient-name"] = patient.fullName();
    data["patient-address"] = patient.address || "";
    data["birth-date"] = `${bd.getGengou()}${bd.getNen()}年${bd.getMonth()}月${bd.getDay()}日`;

    // Get last visit date
    try {
      const visits = await api.listVisitByPatientReverse(patient.patientId, 0, 1);
      if (visits.length > 0) {
        const lastVisitDate = DateWrapper.from(visits[0].visitedAt);
        data["examination-date"] = lastVisitDate.format1();
      }
    } catch (error) {
      console.warn("Could not fetch last visit date:", error);
      // Keep the default examination-date set by setupClinicData
    }
  }
</script>

{#if isVisible}
  <button on:click={doSelectPatient}>患者選択</button>
  <button on:click={doPrint}>印刷</button>

  <div class="fields-container">
    <TextField bind:value={data["patient-address"]} label="住所" />
    <TextField bind:value={data["patient-name"]} label="氏名" />
    <TextField bind:value={data["birth-date"]} label="生年月日" />
    <TextField bind:value={data["condition-name"]} label="傷病名" />
    <TextField bind:value={data["onset-date"]} label="発病年月日" />
    <ConsentTypeField bind:consentType={data["consent-type"]} />
    <SymptomWeaknessField bind:values={data["symptom-weakness"]} />
    <SymptomContractureField bind:values={data["symptom-contracture"]} />
    <TreatmentField bind:values={data["treatment"]} />
    <TextField bind:value={data["symptom-sonota"]} label="症状（その他）" />
    <HouseVisitField bind:values={data["house-visit"]} />
    <TextField bind:value={data["notice"]} label="注意事項等" />
    <TextField bind:value={data["examination-date"]} label="診察日" />
    <TextField bind:value={data["issue-date"]} label="発行日" />
    <TextField bind:value={data["clinic-name"]} label="保険医療機関名" />
    <TextField bind:value={data["clinic-address"]} label="所在地" />
    <TextField bind:value={data["doctor-name"]} label="保険医氏名" />
  </div>
{/if}

<style>
  .fields-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
</style>
