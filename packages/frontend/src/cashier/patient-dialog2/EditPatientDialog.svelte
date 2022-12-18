<script lang="ts">
  import api from "@/lib/api";
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import { Patient, Sex } from "myclinic-model";
  import PatientForm from "../PatientForm.svelte";
  import type { PatientData } from "./patient-data";

  export let data: PatientData;
  export let destroy: () => void;

  let patient: Patient = data.patient;
  let form: PatientForm;

  function close(): void {
    destroy();
    data.goback();
  }

  async function doEnter() {
    const result = form.validate();
    if (result instanceof Patient) {
      await api.updatePatient(result);
      data.patient = result;
      close();
    }
  }

  function doCancel() {
    close();
  }
</script>

<SurfaceModal title="患者情報編集" destroy={close}>
  <PatientForm {patient} bind:this={form}/>
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={doCancel}>キャンセル</button>
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
