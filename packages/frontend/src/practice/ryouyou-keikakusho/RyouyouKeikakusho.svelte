<script lang="ts">
  import DrawerSvg from "@/lib/drawer/DrawerSvg.svelte";
  import type { Op } from "@/lib/drawer/compiler/op";
  import { drawRyouyouKeikakushoShokai } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-shokai-drawer";
  import { drawRyouyouKeikakushoKeizoku } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-keizoku-drawer";
  import ShokaiForm from "./ShokaiForm.svelte";
  import {
    mkRyouyouKeikakushoData,
    type RyouyouKeikakushoData,
  } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-data";
  import KeizokuForm from "./KeizokuForm.svelte";
  import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";
  // import {
  //   createDataMap,
  //   createInterface,
  //   createKeizokuInputs,
  //   createShokaiInputs,
  // } from "@/lib/drawer/forms/ryouyou-keikakusho/meta";
  
  // console.log(createInterface());
  // console.log(createDataMap());
  // console.log(createShokaiInputs());
  // console.log(createKeizokuInputs());

  export let isVisible = false;
  let mode: "shokai" | "keizoku" = "shokai";
  let ryouyouKeikakushoData: RyouyouKeikakushoData = mkRyouyouKeikakushoData();

  function doDisp() {
    let ops: Op[];
    if( mode === "shokai" ) {
      ops = drawRyouyouKeikakushoShokai(ryouyouKeikakushoData);
    } else {
      ops = drawRyouyouKeikakushoKeizoku(ryouyouKeikakushoData);
    }
    const d: DrawerDialog = new DrawerDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        ops,
        viewBox: "0 0 210 297",
        scale: 2,
      }
    })
  }
</script>

{#if isVisible}
  <div>
    <input
      type="radio"
      value="shokai"
      bind:group={mode}
    />
    初回
    <input
      type="radio"
      value="keizoku"
      bind:group={mode}
    /> 継続
  </div>
  <div class="form-inputs">
    {#if mode === "shokai"}
      <ShokaiForm bind:ryouyouKeikakushoData />
    {:else if mode === "keizoku"}
      <KeizokuForm bind:ryouyouKeikakushoData />
    {/if}
  </div>
  <div>
    <button on:click={doDisp}>表示</button>
  </div>
{/if}

<style>
  .form-inputs {
    max-height: 300px;
    overflow: auto;
  }
</style>
