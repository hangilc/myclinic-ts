<script lang="ts">
  import Nav from "@/lib/Nav.svelte";
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import type { VisitEx } from "myclinic-model";

  export let destroy: () => void;
  export let totalPages: number;
  export let records: VisitEx[];
  let page = 0;

  function doGotoPage(pageArg: number): void {

  }
</script>

<SurfaceModal {destroy} title="診療録">
  <Nav {page} total={totalPages} gotoPage={doGotoPage}/>
  <div>
    {#each records as rec (rec.visitId)}
      <div>
        {rec.visitId}
      </div>
    {/each}
  </div>
</SurfaceModal>