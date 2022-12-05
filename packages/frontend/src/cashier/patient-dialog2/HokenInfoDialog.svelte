<script lang="ts">
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import type { Hoken } from "./hoken";
  import type { PatientData } from "./patient-data";

  export let data: PatientData;
  export let hoken: Hoken;
  export let destroy: () => void;

  function close(): void {
    destroy();
    data.goback();
  }
</script>

<SurfaceModal destroy={close} title={`${hoken.name}情報`}>

</SurfaceModal>