<script lang="ts">
  import DrawerSvg from "@/lib/drawer/DrawerSvg.svelte";
  import type { Op } from "@/lib/drawer/compiler/op";
  import { drawRyouyouKeikakushoShokai } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-shokai-drawer";
  import { drawRyouyouKeikakushoKeizoku } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-keizoku-drawer";
  import {
    createDataMap,
    createInterface,
    createKeizokuInputs,
    createShokaiInputs,
  } from "@/lib/drawer/forms/ryouyou-keikakusho/meta";
  import ShokaiForm from "./ShokaiForm.svelte";
  import {
    mkRyouyouKeikakushoData,
    type RyouyouKeikakushoData,
  } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-data";
  import KeizokuForm from "./KeizokuForm.svelte";

  export let isVisible = false;
  let mode: "shokai" | "keizoku" = "shokai";
  let ryouyouKeikakushoData: RyouyouKeikakushoData = mkRyouyouKeikakushoData();
  let ops: Op[] = [];
  $: if (isVisible && ops.length === 0) {
    doSwitchMode();
  }

  // console.log(createInterface());
  // console.log(createDataMap());
  // console.log(createShokaiInputs());
  // console.log(createKeizokuInputs());

  function doSwitchMode() {
    if (mode === "shokai") {
      startShokai();
    } else if (mode === "keizoku") {
      startKeizoku();
    }
  }

  function startShokai() {
    ops = drawRyouyouKeikakushoShokai(ryouyouKeikakushoData);
  }

  function startKeizoku() {
    ops = drawRyouyouKeikakushoKeizoku(ryouyouKeikakushoData);
  }
</script>

{#if isVisible}
  <div>
    <input
      type="radio"
      value="shokai"
      bind:group={mode}
      on:change={doSwitchMode}
    />
    初回
    <input
      type="radio"
      value="keizoku"
      bind:group={mode}
      on:change={doSwitchMode}
    /> 継続
  </div>
  <div class="form-inputs">
    {#if mode === "shokai"}
      <ShokaiForm bind:ryouyouKeikakushoData />
    {:else if mode === "keizoku"}
      <KeizokuForm bind:ryouyouKeikakushoData />
    {/if}
  </div>
  <DrawerSvg
    bind:ops
    width={`${210 * 3}`}
    height={`${297 * 3}`}
    viewBox="0 0 210 297"
  />
{/if}

<style>
  .form-inputs {
    max-height: 300px;
    overflow: auto;
  }

  .form-inputs span + input {
    margin-left: 4px;
  }
</style>
