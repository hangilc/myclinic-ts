<script lang="ts">
  import type { Kouhi, Koukikourei, Shahokokuho } from "myclinic-model";
  import type { Hoken } from "../../hoken";
  import ReferList from "./ReferList.svelte";
  import ReferShahokokuhoDisp from "./ReferShahokokuhoDisp.svelte";

  export let init: () => Promise<Hoken[]>;

  let mode:
    | { mode: "list" }
    | { mode: "shahokokuho"; shahokokuho: Shahokokuho; usageCount: number } = {
    mode: "list",
  };

  function onShahokokuhoSelect(shahokokuho: Shahokokuho, usageCount: number) {
    mode = { mode: "shahokokuho", shahokokuho, usageCount };
  }

  function onKoukikoureiSelect(koukikourei: Koukikourei, usageCount: number) {}

  function onKouhiSelect(kouhi: Kouhi, usageCount: number) {}

  function doList() {
    mode = { mode: "list" };
  }
</script>

<div class="wrapper">
  {#if mode.mode === "list"}
    <ReferList
      {init}
      {onShahokokuhoSelect}
      {onKoukikoureiSelect}
      {onKouhiSelect}
    />
  {:else if mode.mode === "shahokokuho"}
    <ReferShahokokuhoDisp shahokokuho={mode.shahokokuho} usageCount={mode.usageCount} />
    <div class="commands">
      <a href="javascript:void(0)" on:click={doList}>リストへ</a>
    </div>
  {/if}
</div>

<style>
  .wrapper {
    width: 300px;
    height: 342px;
    overflow: auto;
    padding: 4px;
  }

  .commands {
    margin-top: 10px;
  }
</style>
