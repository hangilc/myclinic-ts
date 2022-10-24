<script lang="ts">
  import type { VisitEx } from "@/lib/model";
  import { resolvePaymentStatus } from "./payment-status"

  export let visit: VisitEx;
  let status = resolvePaymentStatus(visit);

</script>

<span class={status.cls}>{status.rep}</span>
