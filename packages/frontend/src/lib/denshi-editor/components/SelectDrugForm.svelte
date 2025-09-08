<script lang="ts">
  import { toZenkaku } from "@/lib/zenkaku";
  import type { RP剤情報Edit } from "../denshi-edit";
  import { drugRep } from "../helper";
  import { daysTimesDisp } from "@/lib/denshi-shohou/disp/disp-util";
  import Link from "@/practice/ui/Link.svelte";

  export let groups: RP剤情報Edit[];

  function doSelectAll() {
    groups.forEach((group) => {
      group.isSelected = true;
      group.薬品情報グループ.forEach((drug) => (drug.isSelected = true));
    });
    groups = groups;
  }

  function doUnselectAll() {
    groups.forEach((group) => {
      group.isSelected = false;
      group.薬品情報グループ.forEach((drug) => (drug.isSelected = false));
    });
    groups = groups;
  }
</script>

<div class="groups">
  {#each groups as group, index (group.id)}
    <div>
      <input type="checkbox" bind:checked={group.isSelected} />{toZenkaku(
        `${index + 1})`,
      )}
    </div>
    <div class="drug-list">
      {#each group.薬品情報グループ as drug (drug.id)}
        <div>
          {#if group.薬品情報グループ.length > 1}
            <input
              type="checkbox"
              bind:checked={drug.isSelected}
            />{/if}{@html drugRep(drug)}
        </div>
      {/each}
      <div></div>
      <div class="usage">
        {group.用法レコード.用法名称}
        {daysTimesDisp(group)}
      </div>
    </div>
  {/each}
</div>
<div class="commands">
  <Link onClick={doSelectAll}>全選択</Link>
  <Link onClick={doUnselectAll}>全解除</Link>
</div>

<style>
  .groups {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .commands {
    margin-top: 10px;
  }
</style>
