<script lang="ts">
  import api from "@/lib/api";
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { genid } from "@/lib/genid";
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import { Invalid, strSrc } from "@/lib/validator";
  import { dateSrc } from "@/lib/validators/date-validator";
  import { validatePatient } from "@/lib/validators/patient-validator";
  import { Patient, Sex, SexType } from "myclinic-model";
  import type { Readable } from "svelte/store";

  export let patient: Readable<Patient>;
  export let ops: {
    goback: () => void
  };
  export let errors: string[] = [];

  let lastName: string = $patient.lastName;
  let firstName: string = $patient.firstName;
  let lastNameYomi: string = $patient.lastNameYomi;
  let firstNameYomi: string = $patient.firstNameYomi;
  let sex: string = $patient.sex;
  let birthday: Date = new Date($patient.birthday);
  let address: string = $patient.address;
  let phone: string = $patient.phone;
  let birthdayErrors: Invalid[] = [];

  async function doEnter() {
    const result = validatePatient($patient.patientId, {
      lastName: strSrc(lastName),
      firstName: strSrc(firstName),
      lastNameYomi: strSrc(lastNameYomi),
      firstNameYomi: strSrc(firstNameYomi),
      sex: strSrc(sex),
      birthday: dateSrc(birthday, birthdayErrors),
      address: strSrc(address),
      phone: strSrc(phone),
    });
    if (result instanceof Patient) {
      await api.updatePatient(result);
      ops.goback();
    } else {
      errors = result;
    }
  }
</script>

<SurfaceModal title="患者情報編集" destroy={ops.goback}>
  {#if errors.length > 0}
    <div class="error">
      {#each errors as e}
        <div>{e}</div>
      {/each}
    </div>
  {/if}
  <div class="panel">
    <span>患者番号</span>
    <span>{$patient.patientId}</span>
    <span>氏名</span>
    <div class="input-block">
      <input type="text" bind:value={lastName} class="name-input" />
      <input type="text" bind:value={firstName} class="name-input" />
    </div>
    <span>よみ</span>
    <div class="input-block">
      <input type="text" bind:value={lastNameYomi} class="name-input" />
      <input type="text" bind:value={firstNameYomi} class="name-input" />
    </div>
    <span>生年月日</span>
    <div class="input-block">
      <DateFormWithCalendar bind:date={birthday} bind:errors={birthdayErrors} />
    </div>
    <span>性別</span>
    <div class="input-block">
      {#each Object.values(Sex) as sexType}
        {@const id = genid()}
        <input type="radio" bind:group={sex} value={sexType.code} {id} />
        <label for={id}>{sexType.rep}</label>
      {/each}
    </div>
    <span>住所</span>
    <div class="input-block">
      <input type="text" bind:value={address} />
    </div>
    <span>電話番号</span>
    <div class="input-block">
      <input type="text" bind:value={phone} />
    </div>
  </div>
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={ops.goback}>キャンセル</button>
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
    margin-top: 10px;
  }

  .commands > * + * {
    margin-left: 4px;
  }

  .error {
    color: red;
  }
</style>
