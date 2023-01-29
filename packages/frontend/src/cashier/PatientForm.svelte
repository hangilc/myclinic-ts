<script lang="ts">
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { genid } from "@/lib/genid";
  import { setFocus } from "@/lib/set-focus";
  import { validResult, VResult } from "@/lib/validation";
  import {
    PatientInput,
    validatePatient,
  } from "@/lib/validators/patient-validator";
  import { Patient, Sex } from "myclinic-model";
  import { createEventDispatcher, onMount, tick } from "svelte";
  import {
    type PatientFormValues,
    blankPatientFormValues,
    patientFormValues,
  } from "./patient-form-values";

  export let patient: Patient | undefined;
  let values: PatientFormValues;
  $: values = formValues(patient);
  onMount(() => (values = formValues(patient)));
  const dispatch = createEventDispatcher<{
    "value-change": void;
  }>();

  function formValues(patient: Patient | undefined): PatientFormValues {
    if (patient) {
      return patientFormValues(patient);
    } else {
      return blankPatientFormValues();
    }
  }

  let validateBirthday: () => VResult<Date | null>;

  export function validate(): VResult<Patient> {
    const input: PatientInput = {
      patientId: validResult(values.patientId),
      lastName: validResult(values.lastName),
      firstName: validResult(values.firstName),
      lastNameYomi: validResult(values.lastNameYomi),
      firstNameYomi: validResult(values.firstNameYomi),
      sex: validResult(values.sex),
      birthday: validateBirthday(),
      address: validResult(values.address),
      phone: validResult(values.phone),
    };
    return validatePatient(input);
  }

  async function onUserInput() {
    dispatch("value-change");
  }
</script>

<div>
  <div class="panel">
    {#if patient && patient.patientId > 0}
      <span>患者番号</span>
      <span>{patient.patientId}</span>
    {/if}
    <span>氏名</span>
    <div class="input-block">
      <input
        type="text"
        bind:value={values.lastName}
        on:change={onUserInput}
        class="name-input"
        data-cy="last-name-input"
        use:setFocus
      />
      <input
        type="text"
        bind:value={values.firstName}
        on:change={onUserInput}
        class="name-input"
        data-cy="first-name-input"
      />
    </div>
    <span>よみ</span>
    <div class="input-block">
      <input
        type="text"
        bind:value={values.lastNameYomi}
        on:change={onUserInput}
        class="name-input"
        data-cy="last-name-yomi-input"
      />
      <input
        type="text"
        bind:value={values.firstNameYomi}
        on:change={onUserInput}
        class="name-input"
        data-cy="first-name-yomi-input"
      />
    </div>
    <span>生年月日</span>
    <div class="input-block">
      <DateFormWithCalendar
        date={values.birthday.value}
        on:value-change={onUserInput}
        bind:validate={validateBirthday}
      />
    </div>
    <span>性別</span>
    <div class="input-block">
      {#each Object.values(Sex) as sexType}
        {@const id = genid()}
        <input
          type="radio"
          bind:group={values.sex}
          value={sexType.code}
          {id}
          on:change={onUserInput}
        />
        <label for={id}>{sexType.rep}</label>
      {/each}
    </div>
    <span>住所</span>
    <div class="input-block">
      <input type="text" bind:value={values.address} on:change={onUserInput} />
    </div>
    <span>電話番号</span>
    <div class="input-block">
      <input type="text" bind:value={values.phone} on:change={onUserInput} />
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
</style>
