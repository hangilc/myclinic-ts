<script lang="ts">
  import type { Op } from "@/lib/drawer/op"
  import { drawerToSvg } from "./drawer-svg"
  import { onMount } from "svelte"

  export let ops: Op[];
  export let viewBox: string;
  export let width: string;
  export let height: string;
  let wrapper: HTMLElement

  onMount(() => {
    let option = {
      viewBox, width, height
    }
    wrapper.appendChild(drawerToSvg(ops, option));
  })

</script>

<div bind:this={wrapper}></div>