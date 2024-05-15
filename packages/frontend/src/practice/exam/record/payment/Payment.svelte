<script lang="ts">
  import api from "@/lib/api";
  import { formatPayment } from "@/lib/format-payment";
  import type { VisitEx } from "myclinic-model";
  import Edit from "./Edit.svelte";
  import PaymentStatus from "./PaymentStatus.svelte";
  import * as kanjidate from "kanjidate";
  // import { calcGendogaku, calcMonthlyFutan } from "@/lib/gendogaku";
  import { MeisaiWrapper, calcRezeptMeisai } from "@/lib/rezept-meisai";

  export let visit: VisitEx;
  let mode = "disp";
  let edit: Edit;

  function paymentRep(visit: VisitEx): string {
    return formatPayment(visit.chargeOption);
  }

  async function doDispClick() {
    if (visit.chargeOption != null) {
      const rezeptMeisai = await calcRezeptMeisai(visit.visitId);
      const patientId = visit.patient.patientId;
      const kd = kanjidate.KanjiDate.fromString(visit.visitedAt);
      const year = kd.year;
      const month = kd.month;
      // const gendogaku = await calcGendogaku(patientId, year, month);
      // const monthlyFutan = await calcMonthlyFutan(patientId, year, month);
      mode = "edit";
      // edit.open(new MeisaiWrapper(rezeptMeisai), gendogaku, monthlyFutan);
      edit.open(new MeisaiWrapper(rezeptMeisai));
    }
  }
</script>

{#if mode === "disp"}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="disp"
    class:has-charge={visit.chargeOption != null}
    on:click={doDispClick}
  >
    {paymentRep(visit)}
    <PaymentStatus {visit} />
  </div>
{/if}
<Edit onClose={() => (mode = "disp")} {visit} bind:this={edit} />

<style>
  .disp.has-charge {
    cursor: pointer;
  }
</style>
