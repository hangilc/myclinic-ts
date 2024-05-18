<script lang="ts">
  import api from "../../../lib/api";
  import { showPatientsByDate, startPatient } from "../exam-vars";
  import type * as m from "myclinic-model";
  import RightBox from "../RightBox.svelte";
  import type { Patient } from "myclinic-model";
  import EditableDate from "@/lib/editable-date/EditableDate.svelte";

  export let date: Date = new Date();
  let patients: Patient[] = [];
  let selectedPatientId: number | null = null;

  update();

  async function update() {
    const ds = await fetchData(date);
    const ps = ds.map(([v, p]) => p);
    const m: Set<number> = new Set();
    patients = [];
    ps.forEach((p) => {
      if (!m.has(p.patientId)) {
        m.add(p.patientId);
        patients.push(p);
      }
    });
  }

  function onCloseClick() {
    showPatientsByDate.set(false);
  }

  async function fetchData(date: Date): Promise<[m.Visit, m.Patient][]> {
    const visits: m.Visit[] = await api.listVisitByDate(date);
    const map: Record<number, m.Patient> = await api.batchGetPatient(
      visits.map((v) => v.patientId)
    );
    return visits.map((v) => [v, map[v.patientId]]);
  }

  function doSelect(patient: Patient): void {
    startPatient(patient);
    selectedPatientId = patient.patientId;
  }
</script>

<RightBox title="日付別患者リスト">
  <div>
    <EditableDate bind:date onChange={update} />
  </div>
  <div class="list">
    {#each patients as patient (patient.patientId)}
      <a
        href="javascript:void(0)"
        on:click={() => doSelect(patient)}
        class="patient-link"
        class:selected={selectedPatientId === patient.patientId}
        >{patient.lastName}{patient.firstName}</a
      >
    {/each}
  </div>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="commands">
    <a href="javascript:void(0)" on:click={onCloseClick}>閉じる</a>
  </div>
</RightBox>

<style>
  .patient-link {
    display: block;
  }

  .patient-link.selected {
    font-weight: bold;
  }

  .commands {
    margin-top: 8px;
    border-top: 1px solid #ccc;
    padding-top: 6px;
  }

  a {
    cursor: pointer;
  }

  .list {
    margin-top: 10px;
  }
</style>
