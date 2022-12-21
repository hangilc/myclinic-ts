<script lang="ts">
  import SearchPatientDialog from "@/lib/SearchPatientDialog.svelte";
  import SurfacePulldown from "@/lib/SurfacePulldown.svelte";
  import type { Patient } from "myclinic-model";

  export let destroy: () => void;
  export let anchor: HTMLElement | SVGSVGElement;

  async function openRecords(patient: Patient) {

  }

  function doSearch(): void {
    destroy();
    const d: SearchPatientDialog = new SearchPatientDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "診療録（患者検索）",
        onEnter: (p: Patient) => {
          openRecords(p);
        },
        onSingleResult: (p: Patient, destroy: () => void) => {
          destroy();
          openRecords(p);
        }
      }
    })
  }
</script>

<SurfacePulldown {destroy} {anchor}>
  <a href="javascript:void(0)" on:click={doSearch}>患者検索</a>
  <a href="javascript:void(0)">最近の診察</a>
  <a href="javascript:void(0)">日付別</a>
</SurfacePulldown>

<style>
  a {
    display: block;
    margin: 6px 0;
  }
</style>