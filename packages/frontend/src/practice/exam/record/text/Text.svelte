<script lang="ts">
  import type * as m from "myclinic-model";
  import RegularText from "./regular/RegularText.svelte";
  import ShohouText from "./shohou/ShohouText.svelte";
  import { TextMemoWrapper, type ShohouTextMemo } from "./text-memo";

  export let text: m.Text;
  export let index: number;
  $: shohouMemo = TextMemoWrapper.fromText(text).probeShohouMemo();
</script>

{#if shohouMemo}
  <ShohouText {text} />
{:else}
  <RegularText {text} {index} />
{/if}
