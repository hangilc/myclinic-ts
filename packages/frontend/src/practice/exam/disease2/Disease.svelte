<script lang="ts">
  import Add from "./add/Add.svelte";
  import Current from "./Current.svelte";
  import Tenki from "./Tenki.svelte";
  import Edit from "./edit/Edit.svelte";
  import { currentPatient } from "../ExamVars";
  import { onDestroy, onMount, tick } from "svelte";
  import RightBox from "../RightBox.svelte";
  import { DiseaseEnv } from "./disease-env";
  import type { Mode } from "./mode";

  const unsubs: (() => void)[] = [];
  let comp:
    | undefined
    | typeof Current
    | typeof Add
    | typeof Tenki
    | typeof Edit = undefined;
  let env: DiseaseEnv | undefined = undefined;

  unsubs.push(
    currentPatient.subscribe(async (p) => {
      if (p == null) {
        env = undefined;
        comp = undefined;
      } else {
        env = await DiseaseEnv.create(p);
        comp = Current;
      }
    })
  );

  onDestroy(() => {
    unsubs.forEach((f) => f());
  });

  async function doMode(mode: Mode) {
    let c: typeof comp;
    switch (mode) {
      case "current": {
        c = Current;
        break;
      }
      case "add": {
        c = Add;
        break;
      }
      case "tenki": {
        c = Tenki;
        break;
      }
      case "edit": {
        c = Edit;
        break;
      }
      default: {
        c = undefined;
        break;
      }
    }
    if( c === Edit && env !== undefined ){
      await env.fetchAllList();
    }
    if( c === comp ){
      comp = undefined;
      await tick();
      comp = c;
    } else {
      comp = c;
    }
  }
</script>

{#if env != undefined}
  <RightBox title="病名">
    <div class="workarea">
      <svelte:component this={comp} {env} {doMode} />
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
