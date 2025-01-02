<script lang="ts">
  import { formatPayment } from "@/lib/format-payment";
  import { formatVisitDrug } from "@/lib/format-visit-drug";
  import { formatVisitText } from "@/lib/format-visit-text";
  import { hokenRep } from "@/lib/hoken-rep";
  import { formatPaymentStatus, resolvePaymentStatus } from "@/lib/payment-status";
  import type { VisitEx } from "myclinic-model";
  import { FormatDate } from "myclinic-util";
  import { onMount } from "svelte";

  export let visit: VisitEx;
  export let onMountCallback: () => void = () => {};

  function renderPaymentStatus(visit: VisitEx): string {
    const chargeOpt = visit.chargeOption;
    if( chargeOpt == null ){
      return "";
    } else {
      const charge = chargeOpt.charge;
      const lastPay = visit.lastPayment?.amount ?? 0;
      return formatPaymentStatus(resolvePaymentStatus(charge, lastPay));

    }
  }

  onMount(onMountCallback);
</script>

<div class="top">
  <div class="title">
    <span class="datetime"
      >{FormatDate.f9(visit.visitedAt)}</span
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
          <div>[{conduct.kind.rep}]</div>
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
      <div>
        {formatPayment(visit.chargeOption)}
        {renderPaymentStatus(visit)}
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
