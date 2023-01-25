<script lang="ts">
  import type { Hst } from "@histoire/plugin-svelte";
  import { logEvent } from "histoire/client";
  import { Patient } from "myclinic-model";
  import { ShahokokuhoFormValues } from "./shahokokuho-form-values";
  import ShahokokuhoForm from "./ShahokokuhoForm.svelte";

  export let Hst: Hst;
  let patient: Patient = new Patient(
    123,
    "診療",
    "太郎",
    "",
    "",
    "M",
    "2000-01-01",
    "",
    ""
  );
  let values = new ShahokokuhoFormValues({
    hokenshaBangou: "1234",
  });
</script>

<Hst.Story>
  <ShahokokuhoForm {patient} {values} />
</Hst.Story>
