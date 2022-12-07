<script lang="ts">
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import type { Patient } from "myclinic-model";
  import { Hoken } from "./hoken";
  import ShahokokuhoInfo from "./info/ShahokokuhoInfo.svelte";
  import KoukikoureiInfo from "./info/KoukikoureiInfo.svelte";
  import RoujinInfo from "./info/RoujinInfo.svelte";
  import KouhiInfo from "./info/KouhiInfo.svelte";
  import type { PatientData } from "./patient-data";
  import EditHokenDialog from "./EditHokenDialog.svelte";

  export let data: PatientData;
  export let hoken: Hoken;
  export let destroy: () => void;
  let patient: Patient = data.patient;
  let panel = Hoken.fold(
    hoken.value,
    (_) => ShahokokuhoInfo,
    (_) => KoukikoureiInfo,
    (_) => RoujinInfo,
    (_) => KouhiInfo,
  )

  function close(): void {
    destroy();
    data.goback();
  }

  function exit(): void {
    destroy();
    data.exit();
  }

  function doEdit(): void {
    function open(): void {
      const d: EditHokenDialog = new EditHokenDialog({
        target: document.body,
        props: {
          hoken,
          data,
          destroy: () => d.$destroy()
        }
      })
    }
    destroy();
    console.log("before edit stack", data.stack);
    data.push(open);
  }
</script>

<SurfaceModal destroy={exit} title={`${hoken.name}情報`}>
  <svelte:component this={panel} {patient} {hoken} />
  <div class="commands">
    <button on:click={doEdit}>編集</button>
    <button on:click={close}>閉じる</button>
  </div>
</SurfaceModal>

<style>
  .commands {
    margin-top: 10px;
    display: flex;
    justify-content: right;
    align-items: center;
  }

  .commands > * + * {
    margin-left: 4px;
  }
</style>