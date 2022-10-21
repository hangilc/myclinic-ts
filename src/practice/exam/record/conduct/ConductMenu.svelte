<script lang="ts">
  import type { VisitEx } from "@/lib/model"
  import Pulldown from "@/lib/Pulldown.svelte"
  import EnterXpWidget from "./EnterXpWidget.svelte"

  export let visit: VisitEx
  let anchor: HTMLElement;
  let pulldown: Pulldown;
  let workarea: HTMLElement;

  function doClick(): void {
    pulldown.open();
  }

  function doXp(): void {
    const w = new EnterXpWidget({
      target: workarea,
      props: {

      }
    });
  }
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<a href="javascript:void(0)" bind:this={anchor} on:click={doClick}>処置</a>
<div bind:this={workarea}></div>

<!-- svelte-ignore a11y-invalid-attribute -->
<Pulldown anchor={anchor} bind:this={pulldown}>
  <a href="javascript:void(0)" on:click={doXp}>Ｘ線検査追加</a>
  <a href="javascript:void(0)">注射追加</a>
  <a href="javascript:void(0)">全部コピー</a>
</Pulldown>