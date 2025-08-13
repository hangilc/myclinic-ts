<script lang="ts">
  import { daysTimesDisp } from "@/lib/denshi-shohou/disp/disp-util";
  import type { PrevSearchItem } from "./prev-search-item";
  import { drugRep } from "../../helper";
  import { toZenkaku } from "@/lib/zenkaku";

  export let item: PrevSearchItem;
</script>

<div class="groups">
  {#each item.groups as group, index}
    <div>{toZenkaku(`${index + 1})`)}</div>
    <div class="drug-list">
      {#each group.薬品情報グループ as drug, index}
        <div>{drugRep(drug)}</div>
      {/each}
      <div></div>
      <div class="usage">
        {group.用法レコード.用法名称}
        {daysTimesDisp(group)}
      </div>
    </div>
  {/each}
</div>

<style>
  .groups {
    display: grid;
    grid-template-columns: auto 1fr;
  }
</style>
