<script lang="ts">
  import type * as m from "myclinic-model";
  import RegularText from "./regular/RegularText.svelte";
  import type { ShohouTextMemo } from "./text-memo";
  import ShohouText from "./shohou/ShohouText.svelte";

  export let text: m.Text;
  export let index: number;
  let mode: "regular" | "shohou" = "regular";
  if( text.memo ){
    let memo = JSON.parse(text.memo);
    if( memo.kind === "shohou" ){
      mode = "shohou";
    }
  }
</script>

{#if mode === "regular"}
  <RegularText {text} {index} />
{:else if mode === "shohou"}
  <ShohouText {text} />
{/if}
