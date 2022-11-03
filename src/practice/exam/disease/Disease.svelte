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

  let show = false;
  let mode = "current";
  let currentList: DiseaseData[] = [];
  let patient: Patient | null = null;
  const unsubs: (() => void)[] = [];
  let examples: DiseaseExample[] = [];

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
    }
  });

  function doMode(m: string): void {
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
      {/if}
    </div>
    <div class="commands">
      <a href="javascript:void(0)" on:click={() => doMode("current")}>現行</a>
      <a href="javascript:void(0)" on:click={() => doMode("add")}>追加</a>
      <a href="javascript:void(0)" on:click={() => doMode("tenki")}>転機</a>
      <a href="javascript:void(0)">編集</a>
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
