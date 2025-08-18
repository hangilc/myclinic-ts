<script lang="ts">
  import { daysTimesDisp } from "@/lib/denshi-shohou/disp/disp-util";
  import { drugRep } from "../../helper";
  import type { PrevSearchItem } from "./prev-search-item";
  import { toZenkaku } from "@/lib/zenkaku";
  import type { RP剤情報Edit } from "../../denshi-edit";

  export let item: PrevSearchItem;
  export let onCancel: () => void;
  export let onSelect: (groups: RP剤情報Edit[]) => void;

  function doEnter() {
    const selected: RP剤情報Edit[] = item.groups.filter(
      (group) => group.isSelected,
    ).map(orig => {
      let group = orig.clone();
      group.薬品情報グループ = group.薬品情報グループ.filter(drug => drug.isSelected);
      return group;
    }).filter(group => group.薬品情報グループ.length > 0);
    if( selected.length === 0 ){
      alert("薬剤が選択されていません。");
    }
    onSelect(selected);
  }

  function doCancel() {
    item.groups.forEach(group => {
      group.isSelected = false;
      group.薬品情報グループ.forEach(drug => drug.isSelected = false);
    });
    onCancel();
  }
</script>

<div class="groups">
  {#each item.groups as group, index (group.id)}
    <div>
      <input type="checkbox" bind:checked={group.isSelected} />{toZenkaku(
        `${index + 1})`,
      )}
    </div>
    <div class="drug-list">
      {#each group.薬品情報グループ as drug (drug.id)}
        <div>
          <input type="checkbox" bind:checked={drug.isSelected} />{drugRep(
            drug,
          )}
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
  <button on:click={doEnter}>追加</button>
  <button on:click={doCancel}>キャンセル</button>
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
