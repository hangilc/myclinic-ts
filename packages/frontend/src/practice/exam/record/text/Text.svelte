<script lang="ts">
  import type * as m from "myclinic-model";
  import RegularText from "./regular/RegularText.svelte";
  import ShohouText from "./shohou/ShohouText.svelte";
  import { TextMemoWrapper, type ShohouTextMemo } from "@/lib/text-memo";

  export let text: m.Text;
  export let index: number;
  export let at: string;
  export let kouhiList: m.Kouhi[];
  export let patientId: number;
  $: shohouMemo = TextMemoWrapper.fromText(text).probeShohouMemo();
</script>

{#if shohouMemo}
  <ShohouText {text} {at} {kouhiList}/>
{:else}
  <RegularText {text} {index} {patientId} />
{/if}
