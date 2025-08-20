<script lang="ts">
  import type { 薬品情報Edit } from "../../denshi-edit";
  import { drugRep } from "../../helper";

  export let drugs: 薬品情報Edit[];
  export let onSelect: (drug: 薬品情報Edit) => void;

  function doSelect(drug: 薬品情報Edit) {
    onSelect(drug);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="top">
  {#each drugs as drug (drug.id)}
    <div class="drug" on:click={() => doSelect(drug)}>{drugRep(drug)}</div>
  {/each}
</div>

<style>
  .top {
    margin: 10px 0;
    border-bottom: 2px solid #ccc;
    padding-bottom: 10px;
    user-select: none;
  }

  .drug {
    font-size: 12px;
    cursor: pointer;
  }
</style>
