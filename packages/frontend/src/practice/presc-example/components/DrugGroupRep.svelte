<script lang="ts">
  import { drugRep } from "@/lib/denshi-editor/helper";
  import { daysTimesDisp } from "@/lib/denshi-shohou/disp/disp-util";
  import type { RP剤情報, 薬品情報 } from "@/lib/denshi-shohou/presc-info";

  export let group: RP剤情報;
  export let onSelect: (group: RP剤情報, drug: 薬品情報) => void;

</script>

<div class="group">
  <div>
    {#each group.薬品情報グループ as drug}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="drug-rep"
        on:click={() => onSelect(group, drug)}
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
