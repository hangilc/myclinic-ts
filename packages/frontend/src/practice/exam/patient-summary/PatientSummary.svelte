<script lang="ts">
  import api from "@/lib/api";
  import { currentPatient } from "../exam-vars";
  import type { PatientSummary } from "myclinic-model";
  import Disp from "./Disp.svelte";
  import Edit from "./Edit.svelte";

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

{#if patientId !== undefined}
  <div>スマリー</div>
  {#if mode === "disp"}
    <Disp {content} onEdit={() => mode = "edit"}/>
  {:else}
    <Edit patientId={patientId} content={content} onCancel={() => mode = "disp"} 
      onEnter={doEnter}/>
  {/if}
{/if}
