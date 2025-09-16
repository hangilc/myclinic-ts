<script lang="ts">
  import type { Writable } from "svelte/store";

  export let serviceStore: Writable<string>;

  function start(srv: string) {
    serviceStore.set(srv);
  }
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<div class="top" data-cy="side-menu">
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

  .top a:last-child {
    margin-bottom: 0;
  }

  a {
    display: block;
    margin-bottom: 4px;
  }

  a.current {
    font-weight: bold;
  }
</style>
