<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import type { Patient } from "myclinic-model";
  import ShahokokuhoForm from "./edit/ShahokokuhoForm.svelte";
  import { newShahokokuhoInput, type ShahokokuhoInput } from "./shahokokuho-input";

  export let destroy: () => void;
  export let patient: Patient;
  let input: ShahokokuhoInput = newShahokokuhoInput(patient.patientId);

</script>

<Dialog {destroy} title="新規社保国保">
  <ShahokokuhoForm {input} {patient}/>
</Dialog>

<style>
</style>
