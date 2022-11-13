<script lang="ts">
  import type { VisitEx } from "myclinic-model"
  import Pulldown from "@/lib/Pulldown.svelte"
  import EnterXpWidget from "./EnterXpWidget.svelte"
  import EnterInjectWidget from "./EnterInjectWidget.svelte"

  export let visit: VisitEx
  let anchor: HTMLElement;
  let pulldown: Pulldown;
  let workarea: HTMLElement;

  function doClick(): void {
    pulldown.open();
  }

  function resolveAnchor(): HTMLElement {
    return workarea.querySelector(".widget");
  }

  function doXp(): void {
    const w = new EnterXpWidget({
      target: workarea,
      anchor: resolveAnchor(),
      props: {
        visit: visit,
      }
    });
    w.open();
  }

  function doInject(): void {
    const w = new EnterInjectWidget({
      target: workarea,
      anchor: resolveAnchor(),
      props: {
        visit: visit,
      }
    });
    w.open();
  }
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<a href="javascript:void(0)" bind:this={anchor} on:click={doClick}>処置</a>
<div bind:this={workarea}></div>

<!-- svelte-ignore a11y-invalid-attribute -->
<Pulldown anchor={anchor} bind:this={pulldown}>
  <a href="javascript:void(0)" on:click={doXp}>Ｘ線検査追加</a>
  <a href="javascript:void(0)" on:click={doInject}>注射追加</a>
  <a href="javascript:void(0)">全部コピー</a>
</Pulldown>