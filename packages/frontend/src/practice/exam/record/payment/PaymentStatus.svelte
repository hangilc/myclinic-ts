<script lang="ts">
  import type { VisitEx } from "myclinic-model";
  import { resolvePaymentStatus } from "./payment-status"

  export let visit: VisitEx;
  let status = resolvePaymentStatus(visit);

</script>

<span class={`payment-status ${status.cls}`}>{status.rep}</span>

<style>
  .payment-status.no-payment {
    color: red;
  }
  .payment-status.under-payment {
    color: orange;
  }
  .payment-status.over-payment {
    color: blue;
  }
</style>