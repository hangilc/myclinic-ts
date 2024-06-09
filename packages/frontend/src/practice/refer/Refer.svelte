<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import DrawerSvg from "@/lib/drawer/DrawerSvg.svelte";
  import type { Op } from "@/lib/drawer/compiler/op";
  import { drawRefer } from "@/lib/drawer/forms/refer/refer-drawer";
  import type { ReferDrawerData } from "@/lib/drawer/forms/refer/refer-drawer-data";

  export let isVisible = false;

  let data: ReferDrawerData = {

  };

  let ops: Op[] = drawRefer(data);
</script>

{#if isVisible}
<ServiceHeader title="紹介状"/>
<DrawerSvg {ops} width={`${210*2}px`} height={`${297*2}px`} viewBox="0 0 210 297"/>
{/if}