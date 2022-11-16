<script lang="ts">
  import type { VisitEx } from "myclinic-model"
  import Pulldown from "@/lib/Pulldown.svelte"
  import EnterXpWidget from "./EnterXpWidget.svelte"
  import EnterInjectWidget from "./EnterInjectWidget.svelte"

  export let visit: VisitEx
  let anchor: HTMLElement;
  let pulldown: Pulldown;
  let enterXpWidget: EnterXpWidget;
  let enterInjectWidget: EnterInjectWidget;

  function doClick(): void {
    pulldown.open();
  }

  function doXp(): void {
    enterXpWidget.open();
  }

  function doInject(): void {
    enterInjectWidget.open();
  }
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<a href="javascript:void(0)" bind:this={anchor} on:click={doClick}>処置</a>
<div>
  <EnterXpWidget {visit} bind:this={enterXpWidget}/>
  <EnterInjectWidget {visit} bind:this={enterInjectWidget}/>
</div>

<!-- svelte-ignore a11y-invalid-attribute -->
<Pulldown anchor={anchor} bind:this={pulldown}>
  <a href="javascript:void(0)" on:click={doXp}>Ｘ線検査追加</a>
  <a href="javascript:void(0)" on:click={doInject}>注射追加</a>
  <a href="javascript:void(0)">全部コピー</a>
</Pulldown>

