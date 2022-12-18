<script lang="ts">
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { genid } from "@/lib/genid";
  import { strSrc, type Invalid } from "@/lib/validator";
  import { dateSrc } from "@/lib/validators/date-validator";
  import { validatePatient } from "@/lib/validators/patient-validator";
  import { Patient, Sex } from "myclinic-model";
  import { onMount } from "svelte";

  export let patient: Patient | undefined;
  let errors: Invalid[] = [];
  let patientId: number | undefined = patient?.patientId;
  let lastName: string = patient?.lastName ?? "";
  let firstName: string = patient?.firstName ?? "";
  let lastNameYomi: string = patient?.lastNameYomi ?? "";
  let firstNameYomi: string = patient?.firstNameYomi ?? "";
  let birthday: Date | null = getBirthday(patient);
  let sex: string = patient?.sex ?? "F";
  let address: string = patient?.address ?? "";
  let phone: string = patient?.phone ?? "";
  let birthdayErrors: Invalid[] = [];
  let focusInput: HTMLInputElement;

  function getBirthday(p: Patient | undefined): Date | null {
    if (p != undefined) {
      return new Date(p.birthday);
    } else {
      return null;
    }
  }

  onMount(() => focusInput.focus());

  export function validate(): Patient | undefined {
    const result = validatePatient(patientId ?? 0, {
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
      return result;
    } else {
      errors = result;
    }
  }
</script>

<div>
  {#if errors.length > 0}
    <div class="error">
      {#each errors as e}
        <div>{e}</div>
      {/each}
    </div>
  {/if}
  <div class="panel">
    {#if patientId && patientId > 0}
      <span>患者番号</span>
      <span>{patientId}</span>
    {/if}
    <span>氏名</span>
    <div class="input-block">
      <input type="text" bind:value={lastName} class="name-input" bind:this={focusInput}/>
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
</div>

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

  .error {
    color: red;
  }
</style>
