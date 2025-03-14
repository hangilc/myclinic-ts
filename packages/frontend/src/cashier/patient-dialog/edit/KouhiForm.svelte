<script lang="ts">
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { gengouListUpto } from "@/lib/gengou-list-upto";
  import { parseOptionalSqlDate, parseSqlDate } from "@/lib/util";
  import { toInt, validResult, type VResult } from "@/lib/validation";
  import { validateKouhi } from "@/lib/validators/kouhi-validator";
  import type { Kouhi, Patient } from "myclinic-model";
  import { createEventDispatcher } from "svelte";

  export let patient: Patient;
  export let init: Kouhi | null;
  let dispatch = createEventDispatcher<{ "value-change": void }>();
  let futansha: string;
  let jukyuusha: string;
  let gendogaku: string;
  let validFrom: Date | null;
  let validUpto: Date | null;
  let gengouList = gengouListUpto("平成");
  let validateValidFrom: (() => VResult<Date | null>) | undefined = undefined;
  let validateValidUpto: (() => VResult<Date | null>) | undefined = undefined;

  updateValues(init);

  function updateValues(init: Kouhi | null): void {
    if (init === null) {
      futansha = "";
      jukyuusha = "";
      gendogaku = "";
      validFrom = null;
      validUpto = null;
    } else {
      futansha = init.futansha.toString();
      jukyuusha = init.jukyuusha.toString();
      gendogaku = init.memoAsJson.gendogaku ? init.memoAsJson.gendogaku.toString : "";
      validFrom = parseSqlDate(init.validFrom);
      validUpto = parseOptionalSqlDate(init.validUpto);
    }
  }

  function validateMemo(): string | undefined {
    if( init?.futansha === 54136015) {
      if( gendogaku === "" ) {
        
      }
    } else {
      return init ? init.memo : undefined;
    }
  }

  export function validate(): VResult<Kouhi> {
    if( !(validateValidFrom && validateValidUpto) ){
      throw new Error("uninitialized validator");
    }
    const input = {
      kouhiId: validResult(init?.kouhiId ?? 0),
      patientId: validResult(patient.patientId),
      futansha: validResult(futansha).validate(toInt),
      jukyuusha: validResult(jukyuusha).validate(toInt),
      validFrom: validateValidFrom(),
      validUpto: validateValidUpto(),
      memo: validateMemo(),
    };
    return validateKouhi(input);
  }

  function doUserInput(): void {
    dispatch("value-change");
  }
</script>

<div>
  <span data-cy="patient-id">({patient.patientId})</span>
  <span data-cy="patient-name">{patient.fullName(" ")}</span>
</div>
<div class="panel">
  <span>負担者番号</span>
  <div>
    <input
      type="text"
      class="regular"
      bind:value={futansha}
      on:change={doUserInput}
      data-cy="futansha-input"
    />
  </div>
  <span>受給者番号</span>
  <div>
    <input
      type="text"
      class="regular"
      bind:value={jukyuusha}
      on:change={doUserInput}
      data-cy="jukyuusha-input"
    />
  </div>
  {#if init?.futansha === 54136015}
    <span>限度額</span>
    <div>
      <input
        type="text"
        class="regular"
        bind:value={gendogaku}
        on:change={doUserInput}
        data-cy="gendogaku-input"
      />
    </div>
  {/if}
  <span>期限開始</span>
  <div data-cy="valid-from-input">
    <DateFormWithCalendar
      init={validFrom}
      on:value-change={doUserInput}
      {gengouList}
      bind:validate={validateValidFrom}
    />
  </div>
  <span>期限終了</span>
  <div data-cy="valid-upto-input">
    <DateFormWithCalendar
      init={validUpto}
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
