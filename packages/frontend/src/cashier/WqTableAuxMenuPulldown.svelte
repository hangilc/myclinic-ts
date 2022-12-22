<script lang="ts">
  import api from "@/lib/api";
  import { confirm } from "@/lib/confirm-call";
  import SurfacePulldown from "@/lib/SurfacePulldown.svelte";
  import type { Patient, Visit } from "myclinic-model";
  import { PatientData } from "./patient-dialog2/patient-data";

  export let destroy: () => void;
  export let anchor: HTMLElement | SVGSVGElement;
  export let patient: Patient;
  export let visit: Visit;

  function doPatient() {
    destroy();
    PatientData.start(patient);
  }

  async function doDeleteVisit() {
    confirm("この診察を削除しますか？", async () => {
      destroy();
      await deleteVisit(visit.visitId);
    })
  }

  async function deleteVisit(visitId: number) {
    try {
      await api.deleteVisitFromReception(visit.visitId);
    } catch(e) {
      alert("削除できませんでした。");
    }
  }

</script>

<SurfacePulldown {destroy} {anchor}>
  <a href="javascript:void(0)" on:click={doPatient}>患者</a>
  <a href="javascript:void(0)" on:click={doDeleteVisit}>削除</a>
</SurfacePulldown>

<style>
  a {
    display: block;
    margin: 4px 0;
  }
</style>