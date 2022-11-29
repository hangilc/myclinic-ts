<script lang="ts">
  import EditableDate from "@/lib/editable-date/EditableDate.svelte";
  import { genid } from "@/lib/genid";
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import { type Patient, Sex, SexType } from "myclinic-model";

  export let patient: Patient;
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
</script>

<SurfaceModal title="患者情報編集" let:close on:close>
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
      <EditableDate date={values.birthday} errors={birthdayErrors} />
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
</style>
