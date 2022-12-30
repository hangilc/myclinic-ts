<script lang="ts">
  import SurfacePulldown from "@/lib/SurfacePulldown.svelte";
  import type { ViewportCoord } from "@/lib/viewport-coord";

  export let destroy: () => void;
  export let anchor: ViewportCoord;
  export let onEdit: () => void;

  function doEdit(): void {
    destroy();
    onEdit();
  }
</script>

<SurfacePulldown {destroy} {anchor}>
  <a href="javascript:void(0)" on:click={doEdit}>編集</a>
  <a href="javascript:void(0)">結合</a>
  <a href="javascript:void(0)">分割</a>
  <a href="javascript:void(0)">延長</a>
  <a href="javascript:void(0)">削除</a>
</SurfacePulldown>

<style>
  a {
    display: block;
    line-height: 1;
    margin-bottom: 4px;
  }

  a:last-of-type {
    margin-bottom: 0;
  }
</style>