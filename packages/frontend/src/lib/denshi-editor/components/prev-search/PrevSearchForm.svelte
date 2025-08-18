<script lang="ts">
  import { daysTimesDisp } from "@/lib/denshi-shohou/disp/disp-util";
  import { drugRep } from "../../helper";
  import type { PrevSearchItem } from "./prev-search-item";
  import { toZenkaku } from "@/lib/zenkaku";
  import type { RP剤情報Edit } from "../../denshi-edit";
  import Link from "../workarea/Link.svelte";
  import { prevDrugRep } from "./helper";

  export let item: PrevSearchItem;
  export let selectedName: string | undefined;
  export let onCancel: () => void;
  export let onSelect: (groups: RP剤情報Edit[]) => void;

  function doEnter() {
    const selected: RP剤情報Edit[] = item.groups
      .filter((group) => group.isSelected)
      .map((orig) => {
        let group = orig.clone();
        group.薬品情報グループ = group.薬品情報グループ.filter(
          (drug) => drug.isSelected,
        );
        return group;
      })
      .filter((group) => group.薬品情報グループ.length > 0);
    if (selected.length === 0) {
      alert("薬剤が選択されていません。");
    }
    onSelect(selected);
  }

  function doCancel() {
    item.groups.forEach((group) => {
      group.isSelected = false;
      group.薬品情報グループ.forEach((drug) => (drug.isSelected = false));
    });
    onCancel();
  }

  function doGroupSelectChange(group: RP剤情報Edit) {
    group.薬品情報グループ.forEach(
      (drug) => (drug.isSelected = group.isSelected),
    );
    item = item;
  }

  function doSelectAll() {
    item.groups.forEach((group) => {
      group.isSelected = true;
      group.薬品情報グループ.forEach((drug) => (drug.isSelected = true));
    });
    item = item;
  }

  function doUnselectAll() {
    item.groups.forEach((group) => {
      group.isSelected = false;
      group.薬品情報グループ.forEach((drug) => (drug.isSelected = false));
    });
    item = item;
  }
</script>

<div class="groups">
  {#each item.groups as group, index (group.id)}
    <div>
      <input
        type="checkbox"
        bind:checked={group.isSelected}
        on:change={() => doGroupSelectChange(group)}
      />{toZenkaku(`${index + 1})`)}
    </div>
    <div class="drug-list">
      {#each group.薬品情報グループ as drug (drug.id)}
        <div>
          {#if group.薬品情報グループ.length > 1}
            <input
              type="checkbox"
              bind:checked={drug.isSelected}
            />{/if}{@html prevDrugRep(drug, selectedName)}
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
