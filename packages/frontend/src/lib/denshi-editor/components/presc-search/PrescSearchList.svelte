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

  export let list: [Text, Visit][] = [];
  export let onSelect: (group: RP剤情報[]) => void;
  export let selectedName: string | undefined = undefined;
  let items: PrescSearchItem[] = list.map(([t, v]) =>
    textToPrescSearchItem(t, v),
  );

  function isDenshi(text: Text): boolean {
    return TextMemoWrapper.fromText(text).getMemoKind() === "shohou";
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

<div>
  {#each list as [text, visit] (text.textId)}
    <div class="item-top">
      {#each items as item}
        <div>{item.title}</div>
        <div>Ｒｐ）</div>
        {#each item.drugs as group, index}
          <div class="group">
            <div>{toZenkaku((index + 1).toString())}）</div>
            <div>
              <div class="drugs">
                {#each group.薬品情報グループ as drug}
                  <div></div>
                  <div>{@html rep(drug)}</div>
                {/each}
              </div>
              <div>
                {group.用法レコード.用法名称}
                {daysTimesDisp(group)}
              </div>
            </div>
          </div>
        {/each}
      {/each}
      <!-- {#if isDenshi(text)}
        <DenshiShohouItem {text} {onSelect} {selectedName} />
      {:else}
        <PaperShohouItem {text} {onSelect} {selectedName} />
      {/if} -->
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
</style>
