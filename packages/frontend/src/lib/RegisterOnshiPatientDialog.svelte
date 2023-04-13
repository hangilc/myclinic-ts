<script lang="ts">
  import type { Patient } from "myclinic-model";
  import Dialog from "./Dialog.svelte";
  import { birthdayRep, sexRep } from "./util";
  import api from "./api";

  export let destroy: () => void;
  export let patient: Patient;
  export let onEnter: (entered: Patient) => void;
  let phone: string = "";

  function doClose(): void {
    destroy();
  }

  async function doEnter() {
    const phoneInput = phone.trim();
    if( phoneInput === "" ){
      alert("電話番号が入力されていません。");
      return;
    }
    const patientTmpl = Object.assign({}, patient, { phone: phoneInput });
    const entered = await api.enterPatient(patientTmpl);
    doClose();
    onEnter(entered);
  }
</script>

<Dialog destroy={doClose} title="新規患者登録" styleWidth="300px">
  <div class="wrapper">
    <span>氏名</span><span>{patient.fullName()}</span>
    <span>よみ</span><span>{patient.fullYomi()}</span>
    <span>生年月日</span><span>{birthdayRep(patient.birthday)}</span>
    <span>性別</span><span>{sexRep(patient.sex)}性</span>
    <span>住所</span><span>{patient.address}</span>
    <span>電話番号</span><input type="text" bind:value={phone} data-cy="phone-input"/>
  </div>
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={doClose}>キャンセル</button>
  </div>
</Dialog>

<style>
  .wrapper {
    display:grid;
    grid-template-columns: auto 1fr;
    align-items: center;
  }

  .wrapper > *:nth-child(odd) {
    margin-right: 10px;
  }

  .wrapper > input {
    margin: 2px 0;
  }

  .commands {
    display: flex;
    justify-content: right;
    margin-top: 10px;
  }

  .commands * + * {
    margin-left: 4px;
  }
</style>
