<script lang="ts">
  import { daysTimesDisp } from "@/lib/denshi-shohou/disp/disp-util";
  import type { PrevSearchItem } from "./prev-search-item";
  import { toZenkaku } from "@/lib/zenkaku";
  import { prevDrugRep } from "./helper";
  import type { RP剤情報Edit, 薬品情報Edit } from "../../denshi-edit";

  export let item: PrevSearchItem;
  export let selectedName: string | undefined;
  export let onSelect: () => void;

  function doGroupClick(group: RP剤情報Edit) {
    group.isSelected = true;
    group.薬品情報グループ.forEach(drug => drug.isSelected = true);
    item.isEditing = true;
    onSelect();
  }

  function doDrugClick(drug: 薬品情報Edit, group: RP剤情報Edit) {
    group.isSelected = true;
    group.薬品情報グループ.forEach(d => d.isSelected = d.id === drug.id);
    item.isEditing = true;
    onSelect();
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="groups">
  {#each item.groups as group, index (group.id)}
    <div class="drug-index" on:click={() => doGroupClick(group)}>{toZenkaku(`${index + 1})`)}</div>
    <div class="drug-list">
      {#each group.薬品情報グループ as drug (drug.id)}
        <div class="drug-rep" on:click={() => doDrugClick(drug, group)}>{@html prevDrugRep(drug, selectedName)}</div>
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

  .drug-index, .drug-rep {
    cursor: pointer;
  }
</style>
