<script lang="ts">
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import type { Charge, Meisai, Patient, Visit } from "myclinic-model";

  export let data: [Meisai, Visit, Patient, Charge];
  export let destroy: () => void;

  function getPatient(): Patient {
    return data[2];
  }

  function patientLine(data: [Meisai, Visit, Patient, Charge]): string {
    const p = data[2];
    return `(${p.patientId}) ${p.fullName()} ${p.fullYomi()}`;
  }
</script>

<SurfaceModal {destroy} title="会計">
  <div class="body">
    <div>
      ({patientLine(data)})
    </div>
  </div>
  <div class="commands">
    <button>領収書印刷</button>
    <button>会計終了</button>
    <button on:click={destroy}>キャンセル</button>
  </div>
</SurfaceModal>

<style>
  .body {
    width: 360px;
  }

  .commands {
    display: flex;
    justify-content: right;
    align-items: center;
  }

  .commands * + * {
    margin-left: 4px;
  }
</style>