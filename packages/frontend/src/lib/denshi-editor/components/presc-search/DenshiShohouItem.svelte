<script lang="ts">
  import type { PrescInfoData } from "@/lib/denshi-shohou/presc-info";
  import { TextMemoWrapper } from "@/lib/text-memo";
  import type { Text, Visit } from "myclinic-model";
  import { drugRep } from "../../helper";

  export let text: Text;
  export let visit: Visit;

  const data: PrescInfoData = TextMemoWrapper.fromText(text).probeShohouMemo()!.shohou;
</script>

<div class="top"></div>
{#each data.RP剤情報グループ as group}
  {#each group.薬品情報グループ as drug}
    <div>{drugRep(drug)}</div>
  {/each}
{/each}

<style>
  .top {
    font-size: 14px;
  }
</style>
