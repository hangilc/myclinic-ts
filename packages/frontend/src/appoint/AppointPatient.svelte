<script lang="ts">
  import type { Appoint } from "myclinic-model";

  export let data: Appoint;

  function patientText(data: Appoint): string {
    let a = "";
    if( data.patientId > 0 ){
      a = `(${data.patientId}) `
    }
    return `${a}${data.patientName}`;
  }
</script>

<div>
  <div>
    {patientText(data)}
  </div>
</div>