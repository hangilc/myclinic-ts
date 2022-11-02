<script lang="ts">
  import type { 
    Patient,
    Disease,
    ByoumeiMaster,
    DiseaseAdj,
    ShuushokugoMaster,
  } from "@/lib/model";
  import { currentPatient } from "@/practice/exam/ExamVars";
  import RightBox from "@/practice/exam/RightBox.svelte";
  import api from "@/lib/api";
  import Current from "./Current.svelte";

  let show = false;
  let mode = "current";
  let currentList: [Disease, ByoumeiMaster, [DiseaseAdj, ShuushokugoMaster][]][] = [];
  let patient: Patient | null = null;

  currentPatient.subscribe(async (p) => {
    patient = p;
    show = p != null;
    if (p != null) {
      currentList = await api.listCurrentDiseaseEx(p.patientId);
    } else {
      currentList = [];
    }
  });
</script>

{#if show}
  <RightBox title="病名">
    {#if mode === "current"}
    <Current list={currentList} />
    {/if}
    <div>
      <a href="javascript:void(0)">現行</a>
      <a href="javascript:void(0)">追加</a>
      <a href="javascript:void(0)">転機</a>
      <a href="javascript:void(0)">編集</a>
    </div>
  </RightBox>
{/if}
