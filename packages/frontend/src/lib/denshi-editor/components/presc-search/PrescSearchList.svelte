<script lang="ts">
  import type { Text, Visit } from "myclinic-model";
  import api from "@/lib/api";
  import PaperShohouItem from "./PaperShohouItem.svelte";
  import { TextMemoWrapper } from "@/lib/text-memo";
  import DenshiShohouItem from "./DenshiShohouItem.svelte";
  import type { RP剤情報 } from "@/lib/denshi-shohou/presc-info";

  export let list: [Text, Visit][] = [];
  export let at: string;
  export let onSelect: (group: RP剤情報[]) => void;

  function isDenshi(text: Text): boolean {
    return TextMemoWrapper.fromText(text).getMemoKind() === "shohou";
  }

</script>

<div>
  {#each list as [text, visit] (text.textId)}
    <div class="item-top">
      {#if isDenshi(text)}
        <DenshiShohouItem {text} onSelect={onSelect}/>
      {:else}
        <PaperShohouItem {text} {at} onSelect={onSelect} />
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
</style>
