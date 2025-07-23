<script lang="ts">
  import type { Text, Visit } from "myclinic-model";
  import api from "@/lib/api";
  import PaperShohouItem from "./PaperShohouItem.svelte";
  import { TextMemoWrapper } from "@/lib/text-memo";
  import DenshiShohouItem from "./DenshiShohouItem.svelte";

  export let list: [Text, Visit][] = [];

  function isDenshi(text: Text): boolean {
    return TextMemoWrapper.fromText(text).getMemoKind() === "shohou";
  }

  $: console.log("list", list);
</script>

<div>
  {#each list as [text, visit] (text.textId)}
    <div class="item-top">
      {#if isDenshi(text)}
        <DenshiShohouItem {text} {visit} />
      {:else}
        <PaperShohouItem {text} {visit} />
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
