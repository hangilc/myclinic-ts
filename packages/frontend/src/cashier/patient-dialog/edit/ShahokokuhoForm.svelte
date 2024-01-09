<script lang="ts">
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { gengouListUpto } from "@/lib/gengou-list-upto";
  import { genid } from "@/lib/genid";
  import { hokenshaBangouRep } from "@/lib/hoken-rep";
  import { parseOptionalSqlDate, parseSqlDate } from "@/lib/util";
  import { toInt, validResult, type VResult } from "@/lib/validation";
  import { validateShahokokuho } from "@/lib/validators/shahokokuho-validator";
  import { toZenkaku } from "@/lib/zenkaku";
  import { HonninKazoku, Shahokokuho, type Patient } from "myclinic-model";
  import { createEventDispatcher } from "svelte";

  export let patient: Patient;
  export let init: Shahokokuho | null;
  let dispatch = createEventDispatcher<{ "value-change": void }>();
  let hokenshaBangou: string;
  let hihokenshaKigou: string;
  let hihokenshaBangou: string;
  let honninStore: number;
  let validFrom: Date | null;
  let validUpto: Date | null;
  let koureiStore: number;
  let edaban: string;
  let validateValidFrom: () => VResult<Date | null>;
  let validateValidUpto: () => VResult<Date | null>;
  // let honninStoreDiabled = false;
  export function setData(data: Shahokokuho | null): void {
    updateValues(data);
  }

  updateValues(init);

  function updateValues(init: Shahokokuho | null): void {
    if (init === null) {
      hokenshaBangou = "";
      hihokenshaKigou = "";
      hihokenshaBangou = "";
      honninStore = 0;
      validFrom = null;
      validUpto = null;
      koureiStore = 0;
      edaban = "";
    } else {
      hokenshaBangou = init.hokenshaBangou.toString();
      hihokenshaKigou = init.hihokenshaKigou;
      hihokenshaBangou = init.hihokenshaBangou;
      if( hokenshaBangouRep(hokenshaBangou) === "国保" ){
        honninStore = 1;
      } else {
        honninStore = init.honninStore;
      }
      validFrom = parseSqlDate(init.validFrom);
      validUpto = parseOptionalSqlDate(init.validUpto);
      koureiStore = init.koureiStore;
      edaban = init.edaban;
    }
  }

  let gengouList = gengouListUpto("平成");

  export function validate(): VResult<Shahokokuho> {
    const input = {
      shahokokuhoId: validResult(init?.shahokokuhoId ?? 0),
      patientId: validResult(patient.patientId),
      hokenshaBangou: validResult(hokenshaBangou).validate(toInt),
      hihokenshaKigou: validResult(hihokenshaKigou),
      hihokenshaBangou: validResult(hihokenshaBangou),
      honninStore: validResult(honninStore),
      validFrom: validateValidFrom(),
      validUpto: validateValidUpto(),
      koureiStore: validResult(koureiStore),
      edaban: validResult(edaban),
    };
    return validateShahokokuho(input);
  }

  function doUserInput(): void {
    dispatch("value-change");
  }

  function doHokenshaBangouChange(): void {
    dispatch("value-change");
    // if( hokenshaBangouRep(hokenshaBangou) === "国保" ){
    //   honninStore = 1;
    //   honninStoreDiabled = true;
    // } else {
    //   honninStoreDiabled = false;
    // }
  }
</script>

<div>
  <span data-cy="patient-id">({patient.patientId})</span>
  <span data-cy="patient-name">{patient.fullName(" ")}</span>
</div>
<div class="panel">
  <span>保険者番号</span>
  <div>
    <input
      type="text"
      class="regular"
      bind:value={hokenshaBangou}
      on:change={doHokenshaBangouChange}
      data-cy="hokensha-bangou-input"
    />
  </div>
  <span>記号・番号</span>
  <div>
    <input
      type="text"
      class="regular"
      bind:value={hihokenshaKigou}
      on:change={doUserInput}
      data-cy="hihokensha-kigou-input"
    />
    ・
    <input
      type="text"
      class="regular"
      bind:value={hihokenshaBangou}
      on:change={doUserInput}
      data-cy="hihokensha-bangou-input"
    />
  </div>
  <span>枝番</span>
  <div>
    <input
      type="text"
      class="edaban"
      bind:value={edaban}
      on:change={doUserInput}
      data-cy="edaban-input"
    />
  </div>
  <span>本人・家族</span>
  <div>
    {#each Object.values(HonninKazoku) as h}
      {@const id = genid()}
      <input
        type="radio"
        {id}
        bind:group={honninStore}
        value={h.code}
        on:change={doUserInput}
        data-cy="honnin-input"
      />
      <label for={id}>{h.rep}</label>
    {/each}
  </div>
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
  <span>高齢</span>
  <div class="kourei">
    <div>
      {#if true}
        {@const id = genid()}
        <input
          type="radio"
          {id}
          class="radio"
          bind:group={koureiStore}
          value={0}
          on:change={doUserInput}
          data-cy="kourei-input"
        />
        <label for={id}>高齢でない</label>
      {/if}
    </div>
    <div>
      {#each [1, 2, 3] as w}
        {@const id = genid()}
        <input
          type="radio"
          {id}
          class="radio"
          bind:group={koureiStore}
          value={w}
          on:change={doUserInput}
          data-cy="kourei-input"
        />
        <label for={id}>{toZenkaku(w.toString())}割</label>
      {/each}
    </div>
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

  input.edaban {
    width: 2rem;
  }
</style>
