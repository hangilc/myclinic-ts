<script lang="ts">
  import SurfacePulldown from "@/lib/SurfacePulldown.svelte";
  import { isAdmin } from "./appoint-vars";

  export let destroy: () => void;
  export let wrapper: HTMLElement;
  export let anchor: HTMLElement | SVGSVGElement;
  export let onCreateAppoints: () => void;

  function doCreateAppoints() {
    destroy();
    onCreateAppoints();
  }
</script>

<SurfacePulldown {destroy} {wrapper} {anchor}>
  {#if isAdmin}
    <a href="javascript:void(0)" on:click={doCreateAppoints}>予約枠わりあて</a>
  {/if}
  <a href="javascript:void(0)">変更履歴</a>
</SurfacePulldown>

<style>
  a {
    display: block;
    margin-bottom: 4px;
  }

  a:last-of-type {
    margin-bottom: 0;
  }
</style>