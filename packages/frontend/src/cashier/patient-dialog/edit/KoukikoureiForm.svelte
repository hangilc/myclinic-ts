<script lang="ts">
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { gengouListUpto } from "@/lib/gengou-list-upto";
  import { genid } from "@/lib/genid";
  import { parseOptionalSqlDate, parseSqlDate } from "@/lib/util";
  import { validResult, VResult } from "@/lib/validation";
  import { validateKoukikourei } from "@/lib/validators/koukikourei-validator";
  import { toZenkaku } from "@/lib/zenkaku";
  import type { Koukikourei, Patient } from "myclinic-model";
  import { createEventDispatcher, onMount } from "svelte";

  export let patient: Patient;
  export let init: Koukikourei | null;
  let dispatch = createEventDispatcher<{ "value-change": void }>();
  let hokenshaBangou: string;
  let hihokenshaBangou: string;
  let futanWari: number;
  let validFrom: Date | null;
  let validUpto: Date | null;
  let gengouList = gengouListUpto("平成");
  let validateValidFrom: () => VResult<Date | null>
  let validateValidUpto: () => VResult<Date | null>

  updateValues(init);

  function updateValues(data: Koukikourei | null): void {
    if( data === null ){
      hokenshaBangou = "";
      hihokenshaBangou = "";
      futanWari = 1;
      validFrom = null;
      validUpto = null;
    } else {
      hokenshaBangou = data.hokenshaBangou;
      hihokenshaBangou = data.hihokenshaBangou;
      futanWari = data.futanWari;
      validFrom = parseSqlDate(data.validFrom);
      validUpto = parseOptionalSqlDate(data.validUpto);
    }
  }

  export function validate(): VResult<Koukikourei> {
    const input = {
      koukikoureiId: validResult(init?.koukikoureiId ?? 0),
      patientId: validResult(patient.patientId),
      hokenshaBangou: validResult(hokenshaBangou),
      hihokenshaBangou: validResult(hihokenshaBangou),
      futanWari: validResult(futanWari),
      validFrom: validateValidFrom(),
      validUpto: validateValidUpto(),
    }
    return validateKoukikourei(input);
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
  <span>保険者番号</span>
  <div>
    <input type="text" class="regular" bind:value={hokenshaBangou} 
      on:change={doUserInput} data-cy="hokensha-bangou-input"/>
  </div>
  <span>被保険者番号</span>
  <div>
    <input type="text" class="regular" bind:value={hihokenshaBangou} on:change={doUserInput}
    data-cy="hihokensha-bangou-input"/>
  </div>
  <span>負担割</span>
  <div>
    {#each [1, 2, 3] as w}
      {@const id = genid()}
      <input type="radio" value={w} bind:group={futanWari} on:change={doUserInput}
      data-cy="futan-wari-input"/>
      <label for={id}>{toZenkaku(w.toString())}割</label>
    {/each}
  </div>
  <span>期限開始</span>
  <div  data-cy="valid-from-input">
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
  }

  .panel > :nth-child(odd) {
    text-align: right;
  }

  input[type="text"].regular {
    width: 6rem;
  }

  input.edaban {
    width: 2rem;
  }
</style>
