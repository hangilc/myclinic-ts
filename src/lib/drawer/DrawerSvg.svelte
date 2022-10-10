<script lang="ts">
  import type { Op } from "@/lib/drawer/op"
  import { drawerToSvg } from "./drawer-svg"
  import { onMount } from "svelte"

  export let ops: Op[];
  let svg

  onMount(() => {
    let option = {

    }
    svg.appendChild(drawerToSvg(ops, option));
  })

</script>

<svg bind:this={svg}></svg>