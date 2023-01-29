<script lang="ts">
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { genid } from "@/lib/genid";
  import { setFocus } from "@/lib/set-focus";
  import { parseSqlDate } from "@/lib/util";
  import { validResult, VResult } from "@/lib/validation";
  import {
    PatientInput,
    validatePatient,
  } from "@/lib/validators/patient-validator";
  import { Patient, Sex } from "myclinic-model";
  import { createEventDispatcher, onMount, tick } from "svelte";

  export let init: Patient | undefined;
  let lastName: string;
  let firstName: string;
  let lastNameYomi: string;
  let firstNameYomi: string;
  let birthday: Date | null;
  let sex: string;
  let address: string;
  let phone: string;

  updateValues(init);

  function updateValues(patient: Patient | undefined) {
    if( patient === undefined ){
      lastName = "";
      firstName = "";
      lastNameYomi = "";
      firstNameYomi = "";
      birthday = null;
      sex = "F";
      address = "";
      phone = "";
    } else {
      lastName = patient.lastName;
      firstName = patient.firstName;
      lastNameYomi = patient.lastNameYomi;
      firstNameYomi = patient.firstNameYomi;
      birthday = parseSqlDate(patient.birthday);
      sex = patient.sex;
      address = patient.address;
      phone = patient.phone;
    }
  }
  const dispatch = createEventDispatcher<{ "value-change": void; }>();

  let validateBirthday: () => VResult<Date | null>;

  export function validate(): VResult<Patient> {
    const input: PatientInput = {
      patientId: validResult(init?.patientId ?? 0),
      lastName: validResult(lastName),
      firstName: validResult(firstName),
      lastNameYomi: validResult(lastNameYomi),
      firstNameYomi: validResult(firstNameYomi),
      sex: validResult(sex),
      birthday: validateBirthday(),
      address: validResult(address),
      phone: validResult(phone),
    };
    return validatePatient(input);
  }

  async function onUserInput() {
    dispatch("value-change");
  }
</script>

<div>
  <div class="panel">
    {#if init && init.patientId > 0}
      <span>患者番号</span>
      <span>{init.patientId}</span>
    {/if}
    <span>氏名</span>
    <div class="input-block">
      <input
        type="text"
        bind:value={lastName}
        on:change={onUserInput}
        class="name-input"
        data-cy="last-name-input"
        use:setFocus
      />
      <input
        type="text"
        bind:value={firstName}
        on:change={onUserInput}
        class="name-input"
        data-cy="first-name-input"
      />
    </div>
    <span>よみ</span>
    <div class="input-block">
      <input
        type="text"
        bind:value={lastNameYomi}
        on:change={onUserInput}
        class="name-input"
        data-cy="last-name-yomi-input"
      />
      <input
        type="text"
        bind:value={firstNameYomi}
        on:change={onUserInput}
        class="name-input"
        data-cy="first-name-yomi-input"
      />
    </div>
    <span>生年月日</span>
    <div class="input-block birthday-input">
      <DateFormWithCalendar
        init={birthday}
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
          bind:group={sex}
          value={sexType.code}
          {id}
          on:change={onUserInput}
          data-cy="sex-input"
        />
        <label for={id}>{sexType.rep}</label>
      {/each}
    </div>
    <span>住所</span>
    <div class="input-block">
      <input type="text" class="address" bind:value={address} on:change={onUserInput} data-cy="address"/>
    </div>
    <span>電話番号</span>
    <div class="input-block">
      <input type="text" class="phone" bind:value={phone} on:change={onUserInput} data-cy="phone"/>
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

  input.address {
    width: 16rem;
  }

  input.phone {
    width: 16rem;
  }
</style>
