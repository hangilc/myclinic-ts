<script lang="ts">
  import DrawerSvg from "@/lib/drawer/DrawerSvg.svelte";
  import type { Op } from "@/lib/drawer/compiler/op";
  import {
    drawRyouyouKeikakushoShokai,
    type RyouyouKeikakushoShokaiData,
  } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-shokai-drawer";
  import {
    type RyouyouKeikakushoKeizokuData,
    drawRyouyouKeikakushoKeizoku,
  } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-keizoku-drawer";

  export let isVisible = false;
  let mode: "shokai" | "keizoku" = "shokai";
  let ops: Op[] = [];
  $: if (isVisible && ops.length === 0) {
    doSwitchMode();
  }

  function doSwitchMode() {
    console.log("doSwitchMode");
    if (mode === "shokai") {
      startShokai();
    } else if (mode === "keizoku") {
      startKeizoku();
    }
  }

  function startShokai() {
    const data: RyouyouKeikakushoShokaiData = {};
    ops = drawRyouyouKeikakushoShokai(data);
  }

  function startKeizoku() {
    const data: RyouyouKeikakushoKeizokuData = {};
    ops = drawRyouyouKeikakushoKeizoku(data);
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
  <DrawerSvg bind:ops={ops} width={`${210*3}`} height={`${297*3}`} viewBox="0 0 210 297"/>
{/if}
