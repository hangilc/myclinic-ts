<script lang="ts">
  import type { VisitEx } from "myclinic-model";
  import EnterXpWidget from "./EnterXpWidget.svelte";
  import EnterInjectWidget from "./EnterInjectWidget.svelte";
  import Popup from "@/lib/Popup.svelte";

  export let visit: VisitEx;
  let anchor: HTMLElement;
  let enterXpWidget: EnterXpWidget;
  let enterInjectWidget: EnterInjectWidget;

  function doXp(): void {
    enterXpWidget.open();
  }

  function doInject(): void {
    enterInjectWidget.open();
  }
</script>

<Popup let:destroyAnd let:trigger>
  <a href="javascript:void(0)" bind:this={anchor} on:click={trigger}>処置</a>
  <div slot="menu" class="popup-menu">
    <a href="javascript:void(0)" on:click={destroyAnd(doXp)}>Ｘ線検査追加</a>
    <a href="javascript:void(0)" on:click={destroyAnd(doInject)}>注射追加</a>
    <a href="javascript:void(0)">全部コピー</a>
  </div>
</Popup>
<div>
  <EnterXpWidget {visit} bind:this={enterXpWidget} />
  <EnterInjectWidget {visit} bind:this={enterInjectWidget} />
</div>

<style>
  .popup-menu a {
    display: block;
    margin-bottom: 4px;
    color: black;
  }

  .popup-menu a:last-of-type {
    margin-bottom: 0;
  }
</style>
