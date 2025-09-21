<script lang="ts">
  import { Kouhi, type Koukikourei, type Shahokokuho } from "myclinic-model";
  import type { Hoken } from "../../hoken";
  import ReferList from "./ReferList.svelte";
  import ReferShahokokuhoDisp from "./ReferShahokokuhoDisp.svelte";
  import ReferKoukikoureiDisp from "./ReferKoukikoureiDisp.svelte";
  import ReferKouhiDisp from "./ReferKouhiDisp.svelte";
  import type { ReferSrc } from "./refer-src";
  import type { KoukikoureiFormValues } from "../koukikourei-form-values";

  export let init: () => Promise<Hoken[]>;
  export let src: ReferSrc = { kind: "none" };
  export let onModify: () => void;

  let mode:
    | { mode: "list" }
    | { mode: "shahokokuho"; shahokokuho: Shahokokuho; usageCount: number }
    | { mode: "koukikourei"; koukikourei: Koukikourei; usageCount: number }
    | { mode: "kouhi"; kouhi: Kouhi; usageCount: number } = {
    mode: "list",
  };

  function onShahokokuhoSelect(shahokokuho: Shahokokuho, usageCount: number) {
    mode = { mode: "shahokokuho", shahokokuho, usageCount };
  }

  function onKoukikoureiSelect(koukikourei: Koukikourei, usageCount: number) {
    mode = { mode: "koukikourei", koukikourei, usageCount };
  }

  function onKouhiSelect(kouhi: Kouhi, usageCount: number) {
    mode = { mode: "kouhi", kouhi, usageCount };
  }

  function doList() {
    mode = { mode: "list" };
  }

  function doPasteKoukikoureiToBlank(
    src: Koukikourei,
    dst: KoukikoureiFormValues,
  ) {
    if (dst.hokenshaBangou === "") {
      dst.hokenshaBangou = src.hokenshaBangou;
    }
    if (dst.hihokenshaBangou === "") {
      dst.hihokenshaBangou = src.hihokenshaBangou;
    }
    onModify();
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
    <ReferShahokokuhoDisp
      shahokokuho={mode.shahokokuho}
      usageCount={mode.usageCount}
    />
    <div class="commands">
      <a href="javascript:void(0)" on:click={doList}>リストへ</a>
    </div>
  {:else if mode.mode === "koukikourei"}
    {@const koukikourei = mode.koukikourei}
    <ReferKoukikoureiDisp {koukikourei} usageCount={mode.usageCount} />
    <div class="commands">
      <a href="javascript:void(0)" on:click={doList}>リストへ</a>
    </div>
    {#if src.kind === "koukikourei"}
      <button
        on:click={() => doPasteKoukikoureiToBlank(koukikourei, src.koukikourei)}
        >→空白に貼付</button
      >
    {/if}
  {:else if mode.mode === "kouhi"}
    <ReferKouhiDisp kouhi={mode.kouhi} usageCount={mode.usageCount} />
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
