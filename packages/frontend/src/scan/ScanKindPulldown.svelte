<script lang="ts">
  import { kindChoices } from "./kind-choices";

  export let destroy: () => void;
  export let onEnter: (kindKey: string) => void;

  function doKey(key: string): void {
    destroy();
    onEnter(key);
  }
</script>

<div data-cy="scan-kind-pulldown">
  {#each Object.keys(kindChoices) as k}
    <a href="javascript:void(0)" on:click={() => doKey(k)}>{k}</a>
  {/each}
</div>

<style>
  a {
    display: block;
    margin-bottom: 6px;
  }

  a:last-of-type {
    margin-bottom: 0;
  }
</style>
