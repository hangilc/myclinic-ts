<script lang="ts">
  import Add from "./add/Add.svelte";
  import Current from "./Current.svelte";
  import Tenki from "./Tenki.svelte";
  import Edit from "./edit/Edit.svelte";
  import { currentPatient } from "../exam-vars";
  import { onDestroy } from "svelte";
  import RightBox from "../RightBox.svelte";
  import { DiseaseEnv } from "./disease-env";
  import type { Mode } from "./mode";
  import api from "@/lib/api";
  import { parseSqlDate } from "@/lib/util";
  import {
    type DiseaseData,
    type DiseaseEnterData,
  } from "myclinic-model";
  import { writable, type Writable } from "svelte/store";
  import Drugs from "./Drugs.svelte";
  import Shinryou from "./Shinryou.svelte";
  import DrugDiseaseComp from "./drug-disease/DrugDisease.svelte";
  import ShinryouDiseaseComp from "./shinryou-disease/ShinryouDisease.svelte";

  const unsubs: (() => void)[] = [];
  let env: Writable<DiseaseEnv | undefined> = writable(undefined);

  unsubs.push(
    currentPatient.subscribe(async (p) => {
      if (p == null) {
        $env = undefined;
      } else {
        const e = await DiseaseEnv.create(p);
        e.mode = "current";
        $env = e;
      }
    })
  );

  onDestroy(() => {
    unsubs.forEach((f) => f());
  });

   async function onDiseaseModified() {
    const cur = $env;
    if( cur ){
      await cur.updateCurrentList();
      await cur.updateAllList();
      await cur.checkDrugs();
      await cur.checkShinryou();
      $env = cur;
    }
  }

  async function doCurrentSelect(d: DiseaseData) {
    const e = $env;
    if( e ){
      await e.fetchAllList();
      let target: DiseaseData | undefined = undefined;
      for(let ele of e.allList ?? []){
        if( ele.disease.diseaseId === d.disease.diseaseId ){
          target = ele;
          break;
        }
      }
      if( !target ){
        throw new Error("cannot find target");
      }
      e.editTarget = target;
      e.mode = "edit";
      $env = e;
    }
  }

  async function doAddDisease(data: DiseaseEnterData) {
    await api.enterDiseaseEx(data);
    await onDiseaseModified();
  }

  async function doTenkiEnter(result: [number, string, string][]) {
    const promises = result.map((r) => {
      const [diseaseId, date, reason] = r;
      return api.endDisease(diseaseId, parseSqlDate(date), reason);
    });
    await Promise.all(promises);
    await onDiseaseModified();
  }

  async function doDeleteDisease(diseaseId: number) {
    await onDiseaseModified();
  }

  async function doUpdateDisease(entered: DiseaseData) {
    await onDiseaseModified();
  }

  async function doDrugsChanged() {
    const e = $env;
    if( e ){
      await e.checkDrugs();
      $env = e;
    }
  }

  async function doShinryouChanged() {
    const e = $env;
    if( e ){
      await e.checkShinryou();
      $env = e;
    }
  }

  async function doChangeMode(mode: Mode) {
    const e = $env;
    if( e ){
      const prev = e.mode;
      if( prev === "edit" && mode !== "edit" ){
        e.allList = [];
      }
      if (mode === "edit") {
        await e.fetchAllList();
      }
      e.mode = mode;
      $env = e;
    }
  }

</script>

{#if $currentPatient !== undefined && $env !== undefined}
  <RightBox title="病名" display={true}>
    <div style="margin-top:6px;">
      {#if $env.mode === "current"}
        <Current {env} onSelect={doCurrentSelect} />
      {:else if $env.mode === "add"}
        <Add {env} onEnter={doAddDisease} />
      {:else if $env.mode === "tenki"}
        <Tenki {env} onEnter={doTenkiEnter} />
      {:else if $env.mode === "edit"}
        <Edit {env} onDelete={doDeleteDisease} onUpdate={doUpdateDisease} />
      {:else if $env.mode === "drugs"}
        <Drugs onChanged={doDrugsChanged}/>
      {:else if $env.mode === "shinryou"}
        <Shinryou onChanged={doShinryouChanged} />
      {/if}
    </div>
    <DrugDiseaseComp {env} />
    <ShinryouDiseaseComp {env} />
    <div class="commands">
      <a href="javascript:void(0)" on:click={() => doChangeMode("current")}
        >現行</a
      >
      <a href="javascript:void(0)" on:click={() => doChangeMode("add")}>追加</a>
      <a href="javascript:void(0)" on:click={() => doChangeMode("tenki")}
        >転機</a
      >
      <a href="javascript:void(0)" on:click={() => doChangeMode("edit")}>編集</a
      >
      <a href="javascript:void(0)" on:click={() => doChangeMode("drugs")}
        >薬剤</a
      >
      <a href="javascript:void(0)" on:click={() => doChangeMode("shinryou")}
        >診療</a
      >
    </div>
  </RightBox>
{/if}

<style>
  .commands {
    margin-top: 6px;
    border-top: 1px solid #ccc;
    padding-top: 6px;
  }
</style>
