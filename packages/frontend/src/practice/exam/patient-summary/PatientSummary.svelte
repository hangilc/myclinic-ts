<script lang="ts">
  import api from "@/lib/api";
  import { currentPatient } from "../exam-vars";
  import type { PatientSummary } from "myclinic-model";
  import Disp from "./Disp.svelte";
  import Edit from "./Edit.svelte";
  import RightBox from "../RightBox.svelte";

  let patientId: number | undefined = undefined;
  let content: string = "";
  let mode: "disp" | "edit" = "disp";

  currentPatient.subscribe(async (patient) => {
    if (patient) {
      const summary = await api.findPatientSummary(patient.patientId);
      if (summary) {
        content = summary.content;
      } else {
        content = "";
      }
      patientId = patient.patientId;
    } else {
      patientId = undefined;
      content = "";
    }
  });

  function doEnter(newContent: string) {
    content = newContent;
    mode = "disp";
  }
</script>

<RightBox
  title="サマリー"
  display={patientId !== undefined}
  dataCy="patient-summary-box"
>
  <div class="workarea">
    {#if mode === "disp"}
      <Disp {content} onEdit={() => (mode = "edit")} />
    {:else if patientId !== undefined}
      <Edit
        {patientId}
        {content}
        onCancel={() => (mode = "disp")}
        onEnter={doEnter}
      />
    {/if}
  </div>
</RightBox>

<style>
  .workarea {
    margin-top: 6px;
  }

</style>
