<script lang="ts">
  import SearchPatientDialog from "@/lib/SearchPatientDialog.svelte";
  import SurfacePulldown from "@/lib/SurfacePulldown.svelte";
  import RecentVisitsDialog from "@/lib/RecentVisitsDialog.svelte";
  import type { Patient, Visit } from "myclinic-model";
  import { openRecords } from "./open-records";
  import VisitsByDateDialog from "@/lib/VisitsByDateDialog.svelte";

  export let destroy: () => void;
  export let anchor: HTMLElement | SVGSVGElement;

  function doSearch(): void {
    destroy();
    const d: SearchPatientDialog = new SearchPatientDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "診療録（患者検索）",
        onEnter: (p: Patient) => {
          openRecords(p.patientId);
        },
        onSingleResult: (p: Patient, destroy: () => void) => {
          destroy();
          openRecords(p.patientId);
        }
      }
    })
  }

  function doRecentVisit(): void {
    destroy();
    const d: RecentVisitsDialog = new RecentVisitsDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "診療録（最近の診察）",
        onEnter: (item: [Visit, Patient]) => {
          destroy();
          openRecords(item[0].patientId);
        }
      }
    })
  }

  function doByDate(): void {
    destroy();
    const d: VisitsByDateDialog = new VisitsByDateDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "診療録（日付別）",
        onEnter: (visit: Visit, patient: Patient) => {
          destroy();
          openRecords(visit.patientId);
        }
      }
    })
  }
</script>

<SurfacePulldown {destroy} {anchor}>
  <a href="javascript:void(0)" on:click={doSearch}>患者検索</a>
  <a href="javascript:void(0)" on:click={doRecentVisit}>最近の診察</a>
  <a href="javascript:void(0)" on:click={doByDate}>日付別</a>
</SurfacePulldown>

<style>
  a {
    display: block;
    margin: 6px 0;
  }
</style>