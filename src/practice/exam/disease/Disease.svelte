<script lang="ts">
  import type {
    Patient,
    Disease,
    ByoumeiMaster,
    DiseaseAdj,
    ShuushokugoMaster,
    DiseaseExample,
  } from "@/lib/model";
  import { currentPatient } from "@/practice/exam/ExamVars";
  import RightBox from "@/practice/exam/RightBox.svelte";
  import api from "@/lib/api";
  import Current from "./Current.svelte";
  import Add from "./Add.svelte";
  import type { DiseaseData } from "./types";
  import { onMount, onDestroy } from "svelte";
  import * as appEvent from "@/practice/app-events";
  import Tenki from "./Tenki.svelte";
    import Edit from "./Edit.svelte";
    import { get } from "svelte/store";

  let show = false;
  let mode = "current";
  let currentList: DiseaseData[] = [];
  let patient: Patient | null = null;
  const unsubs: (() => void)[] = [];
  let examples: DiseaseExample[] = [];
  let allList: DiseaseData[] = undefined;

  unsubs.push(
    appEvent.diseaseEntered.subscribe(async (d) => {
      if (d != null) {
        if (d.patientId === patient?.patientId) {
          const ex = await api.getDiseaseEx(d.diseaseId);
          const curr = currentList;
          curr.push(ex);
          currentList = curr;
        }
      }
    })
  );

  unsubs.push(
    appEvent.diseaseUpdated.subscribe(async (d) => {
      if( d != null && d.patientId === patient?.patientId ){
        if( d.endReasonStore === "N" ){
          const data = await api.getDiseaseEx(d.diseaseId);
          const list = currentList;
          const index = list.findIndex(e => e[0].diseaseId == d.diseaseId);
          if( index >= 0 ){
            list.splice(index, 1, data);
          } else {
            list.push(data);
            list.sort((a, b) => a[0].startDate.localeCompare(b[0].startDate));
          }
          currentList = list;
        } else {
          const list = currentList;
          const index = list.findIndex(e => e[0].diseaseId == d.diseaseId);
          if( index >= 0 ){
            list.splice(index, 1);
            currentList = list;
          }
        }
        if( allList !== undefined ){
          updateAllListWith(d.diseaseId);
        }
      }
    })
  )

  async function updateAllListWith(diseaseId: number) {
    let d = await api.getDiseaseEx(diseaseId);
    const cur = allList;
    const i = cur.findIndex(e => e[0].diseaseId === diseaseId);
    if( i >= 0 ){
      cur.splice(i, 1, d);
    } else {
      cur.push(d);
      cur.sort((a, b) => a[0].startDate.localeCompare(b[0].startDate));
    }
    allList = cur;
  }

  onMount(async () => {
    examples = await api.listDiseaseExample();
  });

  onDestroy(() => {
    unsubs.forEach((f) => f());
  });

  currentPatient.subscribe(async (p) => {
    patient = p;
    show = p != null;
    if (p != null) {
      currentList = await api.listCurrentDiseaseEx(p.patientId);
    } else {
      currentList = [];
      mode = "current";
    }
  });

  async function doMode(m: string) {
    if( m === "edit" && allList === undefined && patient != null ){
      allList = await api.listDiseaseEx(patient.patientId);
    }
    mode = m;
  }
</script>

{#if show}
  <RightBox title="病名">
    <div class="workarea">
      {#if mode === "current"}
        <Current list={currentList} />
      {:else if mode === "add"}
        <Add patientId={patient?.patientId} {examples} />
      {:else if mode === "tenki"}
        <Tenki current={currentList}/>
      {:else if mode === "edit"}
        <Edit list={allList} />
      {/if}
    </div>
    <div class="commands">
      <a href="javascript:void(0)" on:click={() => doMode("current")}>現行</a>
      <a href="javascript:void(0)" on:click={() => doMode("add")}>追加</a>
      <a href="javascript:void(0)" on:click={() => doMode("tenki")}>転機</a>
      <a href="javascript:void(0)" on:click={() => doMode("edit")}>編集</a>
    </div>
  </RightBox>
{/if}

<style>
  .workarea {
    margin-top: 6px;
  }

  .commands {
    margin-top: 6px;
    border-top: 1px solid #ccc;
    padding-top: 6px;
  }
</style>
