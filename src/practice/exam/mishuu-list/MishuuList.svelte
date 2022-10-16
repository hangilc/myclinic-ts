<script lang="ts">
  import { mishuuList } from "@/practice/exam/ExamVars"
  import RightBox from "../RightBox.svelte";
  import * as kanjidate from "kanjidate"
</script>

{#if $mishuuList.length > 0}
<RightBox title="未収リスト">
  {#each $mishuuList as visit (visit.visitId)}
  {@const date = kanjidate.format(kanjidate.f2, visit.visitedAt)}
    <div>
      {date} &nbsp; {(visit.chargeOption?.charge || 0).toLocaleString()}円
    </div>
  {/each}
</RightBox>
{/if}