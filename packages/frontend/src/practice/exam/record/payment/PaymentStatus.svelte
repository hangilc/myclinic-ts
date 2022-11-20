<script lang="ts">
  import type { VisitEx } from "myclinic-model";
  import { resolvePaymentStatus } from "./payment-status"

  export let visit: VisitEx;
  let rep: string = "";
  let cls: string = "";
  $: {
    let status = resolvePaymentStatus(visit);
    rep = status.rep;
    cls = status.cls ?? "";
  }
</script>

<span class={`payment-status ${cls}`}>{rep}</span>

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