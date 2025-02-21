<script lang="ts">
  import type {
    RP剤情報,
  } from "@/lib/denshi-shohou/presc-info";
  import { toZenkaku } from "@/lib/zenkaku";
  import { amountDisp, daysTimesDisp, drugDisp, usageDisp } from "./disp-util";
  import DrugDisp from "./DrugDisp.svelte";

  export let groups: RP剤情報[];

</script>

<div class="wrapper">
  {#each groups as group, i}
    <div>{toZenkaku((i + 1).toString())}）</div>
    <div>
      <div>
        {#each group.薬品情報グループ as drug}
          <div><DrugDisp {drug} /></div>
        {/each}
      </div>
      <div>{usageDisp(group)} <span class="no-break">{daysTimesDisp(group)}</span></div>
    </div>
  {/each}
</div>

<style>
  .wrapper {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px;
  }

  .no-break {
    white-space: nowrap;
  }
</style>
