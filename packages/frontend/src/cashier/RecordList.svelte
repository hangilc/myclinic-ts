<script lang="ts">
  import api from "@/lib/api";
  import { calcPages } from "@/lib/calc-pages";
  import Nav from "@/lib/Nav.svelte";
  import Dialog from "@/lib/Dialog.svelte";
  import type { Patient, VisitEx } from "myclinic-model";
  import { writable, type Writable } from "svelte/store";
  import Record from "./Record.svelte";

  export let destroy: () => void;
  export let totalVisits: number;
  export let patient: Patient;
  let records: VisitEx[] = [];
  const itemsPerPage = 10;
  let page: Writable<number> = writable(0);
  let totalPages: number = calcPages(totalVisits, itemsPerPage);
  let wrapper: HTMLElement;

  page.subscribe(async (newPage) => {
    records = await api.listVisitEx(
      patient.patientId,
      itemsPerPage * newPage,
      itemsPerPage
    );
  });

  async function doGotoPage(nextPage: number) {
    page.set(nextPage);
  }

  function onRecordMount(index: number, total: number): void {
    console.log("mount", index, total, wrapper);
    if( index == total -1 ){
      wrapper.scrollTo(0, 0);
    }
  }

</script>

<Dialog {destroy} title="診療録" styleWidth="500px">
  <Nav page={$page} total={totalPages} gotoPage={doGotoPage} />
  <div>
    ({patient.patientId}) {patient.fullName()}
  </div>
  <div class="records" bind:this={wrapper}>
    {#each records as rec, index (rec.visitId)}
      <Record visit={rec} onMountCallback={() => onRecordMount(index, records.length)}/>
    {/each}
  </div>
</Dialog>

<style>
  .records {
    max-height: 500px;
    overflow-y: auto;
    width: 100%;
  }
</style>
