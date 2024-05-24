<script lang="ts">
  import DrawerSvg from "@/lib/drawer/DrawerSvg.svelte";
  import type { Op } from "@/lib/drawer/compiler/op";
  import {
    drawRyouyouKeikakusho,
    type RyouyouKeikakushoData,
  } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-drawer";

  export let isVisible = false;
  const data: RyouyouKeikakushoData = {};
  const ops: Op[] = drawRyouyouKeikakusho(data);
</script>

{#if isVisible}
  <!-- <DrawerSvg {ops} width="420" height="594" viewBox="0 0 210 297" /> -->
  <DrawerSvg {ops} width="840" height="1188" viewBox="0 0 210 297" />
{/if}
