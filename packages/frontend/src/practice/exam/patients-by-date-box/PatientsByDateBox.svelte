<script lang="ts">
  import api from "../../../lib/api";
  import { showPatientsByDate, startPatient } from "../ExamVars";
  import type * as m from "myclinic-model";
  import RightBox from "../RightBox.svelte";
  import type { Patient } from "myclinic-model";

  let selectedPatientId: number | null = null;

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
  {#await fetchData(new Date())}
    <div>Loading...</div>
  {:then dataList}
    {#each dataList as data}
      {@const [_visit, patient] = data}
      <a
        href="javascript:void(0)"
        on:click={() => doSelect(patient)}
        class="patient-link"
        class:selected={selectedPatientId === patient.patientId}
        >{patient.lastName}{patient.firstName}</a
      >
    {/each}
  {:catch err}
    <div style:color="red">{err}</div>
  {/await}
  <div class="commands">
    <button on:click={onCloseClick}>閉じる</button>
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
    display: flex;
    justify-content: flex-end;
  }
</style>
