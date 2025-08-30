<script lang="ts">
  import type { RP剤情報 } from "@/lib/denshi-shohou/presc-info";
  import { type PrevSearchItem } from "./prev-search-item";
  import PrevSearchForm from "./PrevSearchForm.svelte";
  import PrevSearchRep from "./PrevSearchRep.svelte";

  export let items: PrevSearchItem[] = [];
  export let onSelect: (groups: RP剤情報[]) => void;
  export let selectedName: string | undefined = undefined;

  function doAdd(groups: RP剤情報[], item: PrevSearchItem): void {
    onSelect(groups);
    item.isEditing = false;
    items = items;
  }

  function toggleEditing(item: PrevSearchItem) {
    item.isEditing = !item.isEditing;
    item.groups.forEach((group) => {
      group.isSelected = true;
      group.薬品情報グループ.forEach((drug) => (drug.isSelected = true));
    });
    items = items;
  }

  function doFormCancel(item: PrevSearchItem) {
    item.isEditing = false;
    items = items;
  }

  function doItemSelect() {
    items = items;
  }
</script>

<div class="top">
  {#each items as item}
    <div class="item-top">
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="title" on:click={() => toggleEditing(item)}>{item.title}</div>
      <div>Ｒｐ）</div>
      {#if item.isEditing}
        <PrevSearchForm
          {item}
          selectedName={selectedName}
          onCancel={() => doFormCancel(item)}
          onSelect={(groups) => doAdd(groups, item)}
        />
      {:else}
        <PrevSearchRep {item} selectedName={selectedName} onSelect={doItemSelect}/>
      {/if}
    </div>
  {/each}
</div>

<style>
  .item-top {
    margin: 6px 0;
    border: 1px solid gray;
    border-radius: 4px;
    padding: 10px;
  }

  .title {
    font-weight: bold;
    cursor: pointer;
  }
</style>
