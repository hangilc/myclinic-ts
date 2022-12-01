<script lang="ts">
  import api from "@/lib/api";
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { genid } from "@/lib/genid";
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import { strSrc } from "@/lib/validator";
  import { dateSrc } from "@/lib/validators/date-validator";
  import { validatePatient } from "@/lib/validators/patient-validator";
  import { Patient, Sex } from "myclinic-model";

  export let patient: Patient;
  export let destroy: () => void;
  export let onClose: () => void;

  let values = {
    lastName: patient.lastName,
    firstName: patient.firstName,
    lastNameYomi: patient.lastNameYomi,
    firstNameYomi: patient.firstNameYomi,
    sex: patient.sex,
    birthday: new Date(patient.birthday),
    address: patient.address,
    phone: patient.phone,
  };
  let sexValue: string = patient.sex;
  let birthdayErrors: string[] = [];

  async function doEnter() {
    const result = validatePatient(
      patient.patientId,  
    {
      lastName: strSrc(values.lastName),
      firstName: strSrc(values.firstName),
      lastNameYomi: strSrc(values.lastNameYomi),
      firstNameYomi: strSrc(values.firstNameYomi),
      sex: strSrc(sexValue),
      birthday: dateSrc(values.birthday, birthdayErrors),
      address: strSrc(values.address),
      phone: strSrc(values.phone)
    });
    if( result instanceof Patient ){
      await api.updatePatient(result);
    } else {
      To Be Fixed
    }
  }
</script>

<SurfaceModal title="患者情報編集" {destroy} {onClose}>
  <div class="panel">
    <span>患者番号</span>
    <span>{patient.patientId}</span>
    <span>氏名</span>
    <div class="input-block">
      <input type="text" bind:value={values.lastName} class="name-input" />
      <input type="text" bind:value={values.firstName} class="name-input" />
    </div>
    <span>よみ</span>
    <div class="input-block">
      <input type="text" bind:value={values.lastNameYomi} class="name-input" />
      <input type="text" bind:value={values.firstNameYomi} class="name-input" />
    </div>
    <span>生年月日</span>
    <div class="input-block">
      <DateFormWithCalendar date={values.birthday} errors={birthdayErrors} />
    </div>
    <span>性別</span>
    <div class="input-block">
      {#each Object.values(Sex) as sex}
        {@const id = genid()}
        <input type="radio" bind:group={sexValue} value={sex.code} {id} />
        <label for={id}>{sex.rep}</label>
      {/each}
    </div>
    <span>住所</span>
    <div class="input-block">
      <input type="text" bind:value={values.address}/>
    </div>
    <span>電話</span>
    <div class="input-block">
      <input type="text" bind:value={values.phone}/>
    </div>
  </div>
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={destroy}>キャンセル</button>
  </div>
</SurfaceModal>

<style>
  .panel {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .panel > * {
    margin: 3px 0;
  }

  .panel > :nth-child(odd) {
    margin-right: 6px;
    text-align: right;
  }

  .input-block {
    display: inline-block;
  }

  .name-input {
    width: 80px;
  }

  .commands {
    display: flex;
    justify-content: right;
  }
</style>
