<script lang="ts">
  import type { Text, Visit } from "myclinic-model";
  import PaperShohouItem from "./PaperShohouItem.svelte";
  import { TextMemoWrapper } from "@/lib/text-memo";
  import DenshiShohouItem from "./DenshiShohouItem.svelte";
  import type { RP剤情報, 薬品情報 } from "@/lib/denshi-shohou/presc-info";
  import {
    textToPrescSearchItem,
    type PrescSearchItem,
  } from "./presc-search-item";
  import { toZenkaku } from "@/lib/zenkaku";
  import { drugRep } from "../../helper";
  import { daysTimesDisp } from "@/lib/denshi-shohou/disp/disp-util";
  import PrescSearchItemComponent from "./PrescSearchItem.svelte";

  export let list: [Text, Visit][] = [];
  export let onSelect: (group: RP剤情報[]) => void;
  export let selectedName: string | undefined = undefined;
  let items: PrescSearchItem[] = [];

  $: items = convToItems(list);

  function convToItems(list: [Text, Visit][]): PrescSearchItem[] {
    return list.map(([t, v]) => textToPrescSearchItem(t, v));
  }

  function rep(drug: 薬品情報): string {
    let html = drugRep(drug);
    if (selectedName) {
      return html.replaceAll(
        selectedName,
        `<span style="color: red">${selectedName}</span>`,
      );
    } else {
      return html;
    }
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
            <PrescSearchItemComponent {group} {selectedName} />
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
