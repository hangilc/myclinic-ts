<script lang="ts">
  import EditKoukikoureiDialog from "./edit/EditKoukikoureiDialog.svelte";
  import EditShahokokuhoDialog from "./edit/EditShahokokuhoDialog.svelte";
  import EditKouhiDialog from "./edit/EditKouhiDialog.svelte";
  import { Hoken } from "./hoken";
  import type { PatientData } from "./patient-data";
  import SurfaceModal from "@/lib/SurfaceModal.svelte";

  export let data: PatientData;
  export let hoken: Hoken;
  export let destroy: () => void;
  let errors: string[] = [];

  let title: string = `${hoken.name}編集`;

  let comp =
    hoken === undefined
      ? undefined
      : Hoken.fold(
          hoken?.value,
          (_) => EditShahokokuhoDialog,
          (_) => EditKoukikoureiDialog,
          (_) => undefined,
          (_) => EditKouhiDialog
        );

  function exit(): void {
    destroy();
    data.exit();
  }

  function close(): void {
    destroy();
    data.goback();
  }

  function doEnter() {

  }
</script>

<SurfaceModal destroy={exit} {title}>
  {#if errors.length > 0}
    <div class="error">
      {#each errors as e}
        <div>{e}</div>
      {/each}
    </div>
  {/if}
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={close}>キャンセル</button>
  </div>
</SurfaceModal>

<!-- <svelte:component this={comp} {hoken} {data} {destroy} /> -->
