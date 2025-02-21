<script lang="ts">
  import type * as m from "myclinic-model";
  import RegularText from "./regular/RegularText.svelte";
  import ShohouText from "./shohou/ShohouText.svelte";
  import { TextMemoWrapper, type ShohouTextMemo } from "./text-memo";

  export let text: m.Text;
  export let index: number;
  export let at: string;
  export let kouhiList: m.Kouhi[];
  $: shohouMemo = TextMemoWrapper.fromText(text).probeShohouMemo();
</script>

{#if shohouMemo}
  <ShohouText {text} {at} {kouhiList}/>
{:else}
  <RegularText {text} {index} />
{/if}
