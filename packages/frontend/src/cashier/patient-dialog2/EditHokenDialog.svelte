<script lang="ts">
  import EditKoukikoureiDialog from "./edit/EditKoukikoureiDialog.svelte";
  import EditShahokokuhoDialog from "./edit/EditShahokokuhoDialog.svelte";
  import EditKouhiDialog from "./edit/EditKouhiDialog.svelte";
  import { Hoken } from "./hoken";
  import type { PatientData } from "./patient-data";

  export let data: PatientData;
  export let hoken: Hoken;
  export let destroy: () => void;

  let comp = Hoken.fold(
    hoken.value,
    (_) => EditShahokokuhoDialog,
    (_) => EditKoukikoureiDialog,
    (_) => undefined,
    (_) => EditKouhiDialog,
  )

</script>

<svelte:component this={comp} {hoken} {data} {destroy}/>

