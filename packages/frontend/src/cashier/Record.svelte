<script lang="ts">
  import { formatVisitDrug } from "@/lib/format-visit-drug";
  import { formatVisitText } from "@/lib/format-visit-text";
  import { hokenRep } from "@/lib/hoken-rep";
  import * as kanjidate from "kanjidate";
  import type { VisitEx } from "myclinic-model";

  export let visit: VisitEx;
</script>

<div class="top">
  <div class="title">
    <span class="datetime"
      >{kanjidate.format(kanjidate.f9, visit.visitedAt)}</span
    >
  </div>
  <div class="two-cols">
    <div class="left">
      {#each visit.texts as text (text.textId)}
        <div>{@html formatVisitText(text.content)}</div>
      {/each}
    </div>
    <div class="right">
      <div>{hokenRep(visit)}</div>
      <div>
        {#each visit.shinryouList as shinryou (shinryou.shinryouId)}
          <div>{shinryou.master.name}</div>
        {/each}
      </div>
      {#if visit.drugs.length > 0}
        <div>処方）</div>
      {/if}
      <div>
        {#each visit.drugs as drug, i (drug.drugId)}
          <div>
            {formatVisitDrug(i + 1, drug)}
          </div>
        {/each}
      </div>
      {#if visit.conducts.length > 0}
        <div>処置</div>
      {/if}
      <div>
        {#each visit.conducts as conduct (conduct.conductId)}
          <div>{conduct.kind.rep}</div>
          <div>{conduct.gazouLabel ?? ""}</div>
          {#each conduct.shinryouList as shinryou (shinryou.conductShinryouId)}
            <div>* {shinryou.master.name}</div>
          {/each}
          {#each conduct.drugs as drug (drug.conductDrugId)}
            <div>* {drug.master.name} {drug.amount}{drug.master.unit}</div>
          {/each}
          {#each conduct.kizaiList as kizai (kizai.conductKizaiId)}
            <div>* {kizai.master.name} {kizai.amount}{kizai.master.unit}</div>
          {/each}
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .title {
    padding: 3px 6px;
    background-color: #eee;
    margin-bottom: 6px;
    font-weight: bold;
  }

  .two-cols {
    display: flex;
    align-items: top;
  }

  .left,
  .right {
    flex: 0 0 49%;
  }

  .left {
    margin-right: 1%;
  }

  .right {
    margin-left: 1%;
  }
</style>
