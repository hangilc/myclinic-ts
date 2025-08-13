<script lang="ts">
  import type { Text, Visit } from "myclinic-model";
  import type { RP剤情報 } from "@/lib/denshi-shohou/presc-info";
  import {
    textToPrevSearchItem,
    type PrevSearchItem,
  } from "./prev-search-item";
  import PrevSearchForm from "./PrevSearchForm.svelte";
  import PrevSearchRep from "./PrevSearchRep.svelte";

  export let items: PrevSearchItem[] = [];
  export let onSelect: (group: RP剤情報) => void;
  export let selectedName: string | undefined = undefined;

  function doAdd(group: RP剤情報): void {
    onSelect(group);
  }

  function toggleEditing(item: PrevSearchItem) {
    item.isEditing = !item.isEditing;
    items = items;
    console.log("editing", item.isEditing)
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
          <PrevSearchForm item={item} />
        {:else}
          <PrevSearchRep item={item} />
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
