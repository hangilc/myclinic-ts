<script lang="ts">
  import type { Text } from "myclinic-model";
  import type { ShohouTextMemo } from "../text-memo";
  import { renderDrug } from "@/lib/denshi-shohou/presc-renderer";

  export let text: Text;
  let memo: ShohouTextMemo = JSON.parse(text.memo);
  let drugs = memo.shohou.RP剤情報グループ.map(group => renderDrug(group));
</script>

<div>院外処方</div>
<div>Ｒｐ）</div>
<div class="drugs-wrapper">

{#each drugs as drug, i}
  <div>{i+1})</div>
  <div>
    {#each drug.drugs as d}
      <div>{d}</div>
    {/each}
    <div>{drug.usage} {drug.times}</div>
  </div>
{/each}
</div>

<style>
  .drugs-wrapper {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px;
  }
</style>