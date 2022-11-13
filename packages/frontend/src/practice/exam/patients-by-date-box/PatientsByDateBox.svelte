<script lang="ts">
  import api from "../../../lib/api";
  import { showPatientsByDate } from "../ExamVars";
  import type * as m from "../../../lib/model";
  import RightBox from "../RightBox.svelte";

  function onCloseClick(){
    showPatientsByDate.set(false);
  }

  async function fetchData(date: Date): Promise<[m.Visit, m.Patient][]> {
    const visits: m.Visit[] = await api.listVisitByDate(date);
    const map: Map<number, m.Patient> = await api.batchGetPatient(visits.map(v => v.patientId));
    return visits.map(v => [v, map.get(v.patientId) as m.Patient]);
  }
</script>

<RightBox title="日付別患者リスト">
  {#await fetchData(new Date())}
    <div>Loading...</div>
  {:then dataList}
    {#each dataList as data}
      {@const [_visit, patient] = data}
      <div>{patient.lastName}{patient.firstName}</div>
    {/each}
  {:catch err}
    <div style:color="red">{err}</div>
  {/await}
  <div class="commands">
    <button on:click={onCloseClick}>閉じる</button>
  </div>
</RightBox>

<style>
  .commands {
    display: flex;
    justify-content: flex-end;
  }
</style>