<script lang="ts">
  import type { VisitEx } from "@/lib/model";
  import Edit from "./Edit.svelte";
  import PaymentStatus from "./PaymentStatus.svelte";

  export let visit: VisitEx;
  let mode = "disp";
  let edit: Edit;

  function paymentRep(visit: VisitEx): string {
    const charge = visit.chargeOption;
    if (charge == null) {
      return "（未請求）";
    } else {
      return `請求額：${charge.charge.toLocaleString()}円`;
    }
  }

  function doDispClick(): void {
    if (visit.chargeOption != null) {
      mode = "edit";
      edit.open();
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
