<script lang="ts">
  import { formatPayment } from "@/lib/format-payment";
  import type { VisitEx } from "myclinic-model";
  import Edit from "./Edit.svelte";
  import PaymentStatus from "./PaymentStatus.svelte";
  
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
      mode = "edit";
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
