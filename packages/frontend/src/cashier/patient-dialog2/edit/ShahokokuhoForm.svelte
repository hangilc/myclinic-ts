<script lang="ts">
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { genid } from "@/lib/genid";
  import { HonninKazoku, type Patient } from "myclinic-model";
  import type { ShahokokuhoFormValues } from "./shahokokuho-form-values";

  export let patient: Patient;
  export let values: ShahokokuhoFormValues;

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
  <span>記号・番号</span>
  <div>
    <input
      type="text"
      class="regular"
      bind:value={values.hihokenshaKigou}
      on:change={doUserInput}
    />
    ・
    <input
      type="text"
      class="regular"
      bind:value={values.hihokenshaBangou}
      on:change={doUserInput}
    />
  </div>
  <span>枝番</span>
  <div>
    <input type="text" class="edaban" bind:value={values.edaban}/>
  </div>
  <span>本人・家族</span>
  <div>
    {#each Object.values(HonninKazoku) as h}
      {@const id = genid()}
      <input
        type="radio"
        {id}
        bind:group={values.honninStore}
        value={h.code}
      />
      <label for={id}>{h.rep}</label>
    {/each}
  </div>
  <span>期限開始</span>
  <div>
    <DateFormWithCalendar
      date={values.validFrom}
      onChange={doUserInput}
    />
  </div>
  <span>期限終了</span>
  <div>
    <DateFormWithCalendar
      date={validUpto.value}
      onChange={doValidUptoChange}
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
        />
        <label for={id}>{toZenkaku(w.toString())}割</label>
      {/each}
    </div>
  </div></div>

<!-- <script lang="ts">
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { genid } from "@/lib/genid";
  import { parseOptionalSqlDate, parseSqlDate } from "@/lib/util";
  import { toInt, validResult, type VResult } from "@/lib/validation";
  import { validateShahokokuho } from "@/lib/validators/shahokokuho-validator";
  import { toZenkaku } from "@/lib/zenkaku";
  import { HonninKazoku, Shahokokuho, type Patient } from "myclinic-model";

  export let init: Shahokokuho | undefined;
  export let patient: Patient;
  export let onChange: () => void;

  let hokenshaBangou: string = init?.hokenshaBangou.toString() ?? "";
  let hihokenshaKigou: string = init?.hihokenshaKigou ?? "";
  let hihokenshaBangou: string = init?.hihokenshaBangou ?? "";
  let honninStore: number = init?.honninStore ?? 0;
  let validFrom: VResult<Date | null> = validResult<Date | null>(
    init ? parseSqlDate(init.validFrom) : null
  );
  let validUpto: VResult<Date | null> = validResult<Date | null>(
    init ? parseOptionalSqlDate(init.validFrom) : null
  );
  let koureiStore: number = init?.koureiStore ?? 0;
  let edaban: string = init?.edaban ?? "";

  function doValidFromChange(result: VResult<Date | null>): void {
    validFrom = result;
    onChange();
  }

  function doValidUptoChange(result: VResult<Date | null>): void {
    validUpto = result;
    console.log("validUpto", validUpto);
    onChange();
  }

  export const validate: () => VResult<Shahokokuho> = () => {
    return validateShahokokuho({
      shahokokuhoId: validResult(init?.shahokokuhoId ?? 0),
      patientId: validResult(patient.patientId),
      hokenshaBangou: validResult(hokenshaBangou).validate(toInt),
      hihokenshaKigou: validResult(hihokenshaKigou),
      hihokenshaBangou: validResult(hihokenshaBangou),
      honninStore: validResult(honninStore),
      validFrom,
      validUpto,
      koureiStore: validResult(koureiStore),
      edaban: validResult(edaban),
    });
  };
</script>

<div class="panel">
  <span>({patient.patientId})</span>
  <span>{patient.fullName(" ")}</span>
  <span>保険者番号</span>
  <div>
    <input
      type="text"
      class="regular"
      bind:value={hokenshaBangou}
      on:change={onChange}
    />
  </div>
  <span>記号・番号</span>
  <div>
    <input
      type="text"
      class="regular"
      bind:value={hihokenshaKigou}
      on:change={onChange}
    />
    ・
    <input
      type="text"
      class="regular"
      bind:value={hihokenshaBangou}
      on:change={onChange}
    />
  </div>
  <span>枝番</span>
  <div>
    <input type="text" class="edaban" bind:value={edaban}/>
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
      />
      <label for={id}>{h.rep}</label>
    {/each}
  </div>
  <span>期限開始</span>
  <div>
    <DateFormWithCalendar
      date={validFrom.value}
      onChange={doValidFromChange}
    />
  </div>
  <span>期限終了</span>
  <div>
    <DateFormWithCalendar
      date={validUpto.value}
      onChange={doValidUptoChange}
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
  }

  .panel > * {
    margin: 3px 0;
  }

  .panel > div {
    display: flex;
    align-items: center;
  }

  .panel > :nth-child(odd) {
    margin-right: 6px;
    display: flex;
    justify-content: right;
    align-items: center;
  }

  .panel input.regular {
    width: 6rem;
  }

  .panel input.edaban {
    width: 2rem;
  }

  .panel div.kourei {
    display: inline-block;
  }
</style> -->

<style>
  .panel {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .panel > * {
    margin: 3px 0;
  }

  .panel > div {
    display: flex;
    align-items: center;
  }

  .panel > :nth-child(odd) {
    margin-right: 6px;
    display: flex;
    justify-content: right;
    align-items: center;
  }

  .panel input.regular {
    width: 6rem;
  }

  .panel input.edaban {
    width: 2rem;
  }

  .panel div.kourei {
    display: inline-block;
  }
</style>
