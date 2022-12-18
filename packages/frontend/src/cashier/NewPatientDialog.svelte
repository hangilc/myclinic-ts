<script lang="ts">
  import api from "@/lib/api";
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import type { Patient } from "myclinic-model";
  import { PatientData } from "./patient-dialog2/patient-data";
  import PatientForm from "./PatientForm.svelte";

  export let destroy: () => void;
  let form: PatientForm;

  async function doEnter() {
    let result: Patient | undefined = form.validate();
    if (result != undefined) {
      let entered = await api.enterPatient(result);
      destroy();
      PatientData.start(entered);
    }
  }
</script>

<SurfaceModal {destroy} title="新規患者入力">
  <PatientForm patient={undefined} bind:this={form} />
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={destroy}>キャンセル</button>
  </div>
</SurfaceModal>

<style>
  .commands {
    display: flex;
    justify-content: right;
    margin-top: 10px;
  }

  .commands > * + * {
    margin-left: 4px;
  }
</style>
