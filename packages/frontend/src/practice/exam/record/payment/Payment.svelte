<script lang="ts">
  import api from "@/lib/api";
  import { formatPayment } from "@/lib/format-payment";
  import type { VisitEx } from "myclinic-model";
  import Edit from "./Edit.svelte";
  import PaymentStatus from "./PaymentStatus.svelte";

  export let visit: VisitEx;
  let mode = "disp";
  let edit: Edit;

  function paymentRep(visit: VisitEx): string {
    return formatPayment(visit.chargeOption);
  }

  async function doDispClick() {
    if (visit.chargeOption != null) {
      const meisai = await api.getMeisai(visit.visitId);
      mode = "edit";
      edit.open(meisai);
    }
  }
</script>

{#if mode === "disp"}
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
