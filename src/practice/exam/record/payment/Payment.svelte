<script lang="ts">
  import type { VisitEx } from "@/lib/model";
    import PaymentStatus from "./PaymentStatus.svelte";

  export let visit: VisitEx;
  let mode = "disp";

  function paymentRep(visit: VisitEx): string {
    const charge = visit.chargeOption;
    if( charge == null ){
      return "（未請求）"
    } else {
      return `請求額：${charge.charge.toLocaleString()}円`;
    }
  }
</script>

{#if mode === "disp"}
<div>
  {paymentRep(visit)} <PaymentStatus {visit} />
</div>
{/if}
