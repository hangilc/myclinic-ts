<script lang="ts">
  import type * as m from "myclinic-model";
  import RegularText from "./regular/RegularText.svelte";
  import ShohouText from "./shohou/ShohouText.svelte";
  import { TextMemoWrapper, type ShohouTextMemo } from "./text-memo";

  export let text: m.Text;
  export let index: number;
  const memoWrapper = TextMemoWrapper.fromText(text);
  const shohouMemo = memoWrapper.probeShohouMemo();
</script>

{#if shohouMemo}
  <ShohouText memo={shohouMemo} textId={text.textId} />
{:else}
  <RegularText {text} {index} />
{/if}
