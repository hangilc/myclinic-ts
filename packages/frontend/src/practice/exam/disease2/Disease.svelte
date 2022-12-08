<script lang="ts">
  import Add from "./Add.svelte";
  import Current from "./Current.svelte";
  import Tenki from "./Tenki.svelte";
  import Edit from "./Edit.svelte";
  import { currentPatient } from "../ExamVars";
  import { onDestroy, onMount } from "svelte";
  import RightBox from "../RightBox.svelte";
  import { DiseaseEnv } from "./disease-env";

  const unsubs: (() => void)[] = [];
  let comp: undefined | typeof Current | typeof Add | typeof Tenki | typeof Edit  = undefined;
  let env: DiseaseEnv | undefined = undefined;

  onMount(async () => {
    examples = await api.listDiseaseExample();
  });
  
  unsubs.push(currentPatient.subscribe(async (p) => {
    if( p == null ){
      env = undefined;
      comp = undefined;
    } else {
      env = await DiseaseEnv.create(p);
      comp = Current;
    }
  }))

  onDestroy(() => {
    unsubs.forEach(f => f());
  })

  function doMode(mode: string){
    switch(mode){
      case "current": {
        comp = Current;
        break;
      }
      case "add": {
        comp = Add;
        break;
      }
      case "tenki": {
        comp = Tenki;
        break;
      }
      case "edit": {
        comp = Edit;
        break;
      }
      default: {
        comp = undefined;
        break;
      }
    }
  }


</script>

{#if comp !== undefined}
<RightBox title="病名">
  <div class="workarea">
    <svelte:component this={comp} {env} />
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
