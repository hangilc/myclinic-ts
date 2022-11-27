<script type="ts">
  import type { Writable } from "svelte/store";

  export let serviceStore: Writable<string>;

  function start(srv: string) {
    serviceStore.set(srv);
  }
</script>

<div class="top">
  <a
    href="javascript:void(0);"
    on:click={() => start("main")}
    class:current={$serviceStore === "main"}>メイン</a
  >
  <a
    href="javascript:void(0)"
    on:click={() => start("scan")}
    class:current={$serviceStore === "scan"}>スキャン</a
  >
</div>

<style>
  .top {
    background-color: #eee;
    padding: 6px;
  }

  a {
    display: block;
  }

  a.current {
    font-weight: bold;
  }
</style>
