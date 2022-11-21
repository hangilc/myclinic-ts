<script type="ts">
  import type { Writable } from "svelte/store";

  export let serviceStore: Writable<string>;

  function start(srv: string) {
    serviceStore.set(srv);
  }
</script>

<div class="top">
  <a href="javascript:void(0);" on:click={() => start("main")}>メイン</a>
  <a href="javascript:void(0)" on:click={() => start("scan")}>スキャン</a>
</div>

<style>
.top {
  background-color: #eee;
  padding: 6px;
}

a {
  display: block;
}  
</style>