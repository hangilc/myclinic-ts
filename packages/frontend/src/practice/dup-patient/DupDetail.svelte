<script lang="ts">
  import type { Patient } from "myclinic-model";

  export let patient1: Patient
  export let patient2: Patient
</script>

<div>
  [{patient1.patientId}]
  [{patient2.patientId}]
</div>
