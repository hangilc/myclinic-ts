<script lang="ts">
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { gengouListUpto } from "@/lib/gengou-list-upto";
  import { genid } from "@/lib/genid";
  import { validResult, VResult } from "@/lib/validation";
  import { validateKoukikourei } from "@/lib/validators/koukikourei-validator";
  import { toZenkaku } from "@/lib/zenkaku";
  import type { Koukikourei, Patient } from "myclinic-model";
  import type { KoukikoureiFormValues } from "./koukikourei-form-values";

  export let patient: Patient;
  export let values: KoukikoureiFormValues;
  let gengouList = gengouListUpto("平成");
  let validateValidFrom: (() => VResult<Date | null>) | undefined = undefined;
  let validateValidUpto: (() => VResult<Date | null>) | undefined = undefined;

  export function validate(): VResult<Koukikourei> {
    if (validateValidFrom && validateValidUpto) {
      const input = {
        koukikoureiId: validResult(values.koukikoureiId),
        patientId: validResult(patient.patientId),
        hokenshaBangou: validResult(values.hokenshaBangou),
        hihokenshaBangou: validResult(values.hihokenshaBangou),
        futanWari: validResult(values.futanWari),
        validFrom: validateValidFrom(),
        validUpto: validateValidUpto(),
      };
      return validateKoukikourei(input);
    } else {
      throw new Error("uninitialized validator");
    }
  }

  function doUserInput(): void {}
</script>

<div>
  <span>({patient.patientId})</span>
  <span>{patient.fullName(" ")}</span>
</div>
<div class="panel">
  <span>保険者番号</span>
  <div>
    <input
      type="text"
      class="regular"
      bind:value={values.hokenshaBangou}
      on:change={doUserInput}
    />
  </div>
  <span>被保険者番号</span>
  <div>
    <input
      type="text"
      class="regular"
      bind:value={values.hihokenshaBangou}
      on:change={doUserInput}
    />
  </div>
  <span>負担割</span>
  <div>
    {#each [1, 2, 3] as w}
      {@const id = genid()}
      <input
        type="radio"
        value={w}
        bind:group={values.futanWari}
        on:change={doUserInput}
      />
      <label for={id}>{toZenkaku(w.toString())}割</label>
    {/each}
  </div>
  <span>期限開始</span>
  <div data-cy="valid-from-input">
    <DateFormWithCalendar
      init={values.validFrom}
      on:value-change={doUserInput}
      {gengouList}
      bind:validate={validateValidFrom}
    />
  </div>
  <span>期限終了</span>
  <div data-cy="valid-upto-input">
    <DateFormWithCalendar
      init={values.validUpto}
      on:value-change={doUserInput}
      {gengouList}
      bind:validate={validateValidUpto}
    />
  </div>
</div>

<style>
  .panel {
    display: grid;
    grid-template-columns: auto 1fr;
    row-gap: 6px;
    column-gap: 6px;
    width: 340px;
  }

  .panel > :nth-child(odd) {
    text-align: right;
  }

  input[type="text"].regular {
    width: 6rem;
  }
</style>
