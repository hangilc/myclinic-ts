<script lang="ts">
  import type { Patient } from "myclinic-model";
  import Dialog from "../Dialog.svelte";
  import type { OnshiPatient } from "../face-confirm-window";
  import * as kanjidate from "kanjidate";

  export let destroy: () => void;
  export let onConfirmed: () => void;
  export let onCancel: () => void;
  export let patient: Patient;
  export let onshiPatient: OnshiPatient;

  function doSelect() {
    destroy();
    onConfirmed();
  }

  function doCancel() {
    destroy();
    onCancel();
  }
</script>

<Dialog title="患者確認" destroy={doCancel}>
  <div class="wrapper">
    <div>
      氏名：{patient.fullName(" ")}
    </div>
    <div>
      オンライン資格氏名：{onshiPatient.lastName} {onshiPatient.firstName}
    </div>
    <div>
      患者番号：{patient.patientId}
    </div>
    <div>
      生年月日：{kanjidate.format(kanjidate.f5, patient.birthday)}
    </div>
    <div>
      年齢：{kanjidate.calcAge(new Date(patient.birthday))}才
    </div>
    <div>
      性別：{patient.sex === "M" ? "男" : "女"}
    </div>
    <div>
      住所：{patient.address}
    </div>
    <div>
      オンライン資格住所：{onshiPatient.address}
    </div>
  </div>
  <div class="commands">
    <button on:click={doSelect}>患者選択</button>
    <button on:click={doCancel}>キャンセル</button>
  </div>
</Dialog>

<style>
  .wrapper > div {
    margin: 6px 0;
  }

  .commands {
    display: flex;
    justify-content: right;
  }

  .commands button {
    margin-left: 4px;
  }
</style>