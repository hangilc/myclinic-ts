<script lang="ts">
  import { drugRep } from "@/lib/denshi-editor/helper";
  import { daysTimesDisp } from "@/lib/denshi-shohou/disp/disp-util";
  import type { RP剤情報 } from "@/lib/denshi-shohou/presc-info";
  import type { DrugPrefab } from "@/lib/drug-prefab";

  export let drugPrefab: DrugPrefab;
  export let onSelect: (value: DrugPrefab) => void;

</script>

<div class="group">
  <div>
    {#each drugPrefab.presc.薬品情報グループ as drug, index}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="drug-rep"
        on:click={() => onSelect(group, index)}
      >
        <span>{drugRep(drug)}</span>
      </div>
    {/each}
    <div class="usage-rep">
      {group.用法レコード.用法名称}
      {daysTimesDisp(group)}
    </div>
  </div>
</div>

<style>
  .drug-rep {
    cursor: pointer;
  }
</style>
