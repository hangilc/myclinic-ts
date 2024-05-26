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
  // const data: RyouyouKeikakushoShokaiData = {};
  // const ops: Op[] = drawRyouyouKeikakushoShokai(data);
  const data: RyouyouKeikakushoKeizokuData = {};
  const ops: Op[] = drawRyouyouKeikakushoKeizoku(data);
</script>

{#if isVisible}
  <!-- <DrawerSvg {ops} width="420" height="594" viewBox="0 0 210 297" /> -->
  <DrawerSvg {ops} width="840" height="1188" viewBox="0 0 210 297" />
{/if}
