<script lang="ts">
  import type { Text, Visit } from "myclinic-model";
  import type { RP剤情報 } from "@/lib/denshi-shohou/presc-info";
  import {
    textToPrescSearchItem,
    type PrescSearchItem,
  } from "./presc-search-item";
  import { toZenkaku } from "@/lib/zenkaku";
  import PrescSearchItemComponent from "./PrescSearchItem.svelte";

  export let list: [Text, Visit][] = [];
  export let onSelect: (group: RP剤情報) => void;
  export let selectedName: string | undefined = undefined;
  let items: PrescSearchItem[] = [];

  $: items = convToItems(list);

  function convToItems(list: [Text, Visit][]): PrescSearchItem[] {
    return list.map(([t, v]) => textToPrescSearchItem(t, v));
  }

  function doAdd(group: RP剤情報): void {
    onSelect(group);
  }
</script>

<div class="top">
  {#each items as item}
    <div class="item-top">
      <div class="title">{item.title}</div>
      <div>Ｒｐ）</div>
      {#each item.drugs as group, index}
        <div class="group">
          <div>{toZenkaku((index + 1).toString())}）</div>
          <div>
            <PrescSearchItemComponent {group} {selectedName} onSelect={doAdd}/>
          </div>
        </div>
      {/each}
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
  }

  .group {
    display: grid;
    grid-template-columns: auto 1fr;
  }
</style>
