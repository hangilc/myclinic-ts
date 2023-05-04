<script lang="ts">
  import type { Appoint } from "myclinic-model";
  import { getPatientRep, type ConfirmStatus, startConfirm, type ConfirmError } from "./onshi-confirm-for-date";
  import type { Writable } from "svelte/store";

  export let appoint: Appoint;
  export let date: string;
  export let onDone: () => void;
  const patientRep: string = getPatientRep(appoint);
  const status: Writable<ConfirmStatus> = startConfirm(appoint, date);
  status.subscribe(s => {
    if( s.isDone ){
      onDone();
    }
  });

  function errorClass(err: ConfirmError): string {
    switch(err){
      case "": return "";
      case "患者番号なし":
        case "情報不一致":
          case "保険なし": {
            return "medium-error";
          }
      default: return "error"
    }
  }

</script>

<div class={errorClass($status.error)}>
  {patientRep}: {$status.message}
</div>

<style>
  .error {
    font-weight: bold;
    color: red;
  }

  .medium-error {
    font-weight: bold;
    color: orange;
  }
</style>
