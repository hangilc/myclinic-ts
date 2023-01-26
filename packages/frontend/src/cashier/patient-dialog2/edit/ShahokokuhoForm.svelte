<script lang="ts">
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { gengouListUpto } from "@/lib/gengou-list-upto";
  import { genid } from "@/lib/genid";
  import { toInt, validResult, type VResult } from "@/lib/validation";
  import { validateShahokokuho } from "@/lib/validators/shahokokuho-validator";
  import { toZenkaku } from "@/lib/zenkaku";
  import { HonninKazoku, Shahokokuho, type Patient } from "myclinic-model";
  import { createEventDispatcher, onMount } from "svelte";
  import { ShahokokuhoFormValues } from "./shahokokuho-form-values";

  export let patient: Patient;
  export let data: Shahokokuho | null | undefined;
  let dispatch = createEventDispatcher<{
    "value-change": VResult<Shahokokuho>
    }>();
  let values: ShahokokuhoFormValues;
  $: onExternalData(data);
  onMount(() => onExternalData(data));
  let gengouList = gengouListUpto("平成");
  let validFromResult: VResult<Date | null>;
  let validUptoResult: VResult<Date | null>;

  function onExternalData(data: Shahokokuho | null | undefined){
    if( data !== undefined ){
      if( data === null ){
        values = ShahokokuhoFormValues.blank();
      } else {
        values = ShahokokuhoFormValues.from(data);
        dispatch("value-change", validResult(data));
      }
      validFromResult = validResult(values.validFrom);
      validUptoResult = validResult(values.validUpto);
    }
  }

  export function validate(): VResult<Shahokokuho> {
    const input = {
      shahokokuhoId: validResult(values.shahokokuhoId),
      patientId: validResult(values.patientId),
      hokenshaBangou: validResult(values.hokenshaBangou).validate(toInt),
      hihokenshaKigou: validResult(values.hihokenshaKigou),
      hihokenshaBangou: validResult(values.hihokenshaBangou),
      honninStore: validResult(values.honninStore),
      validFrom: validFromResult,
      validUpto: validUptoResult,
      koureiStore: validResult(values.koureiStore),
      edaban: validResult(values.edaban),
    }
    return validateShahokokuho(input);
  }

  function doUserInput(): void {
    const vs = validate();
    if( vs.isValid ){
      onExternalData(vs.value);
    } else {
      onExternalData(undefined);
      dispatch("value-change", vs);
    }
  }

  function onValidFromChange(evt: CustomEvent<VResult<Date | null>>): void {
    validFromResult = evt.detail;
    doUserInput();
  }

  function onValidUptoChange(evt: CustomEvent<VResult<Date | null>>): void {
    validUptoResult = evt.detail;
    doUserInput();
  }

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
    <input type="text" class="edaban" bind:value={values.edaban} on:change={doUserInput}/>
  </div>
  <span>本人・家族</span>
  <div>
    {#each Object.values(HonninKazoku) as h}
      {@const id = genid()}
      <input type="radio" {id} bind:group={values.honninStore} value={h.code} 
        on:change={doUserInput}/>
      <label for={id}>{h.rep}</label>
    {/each}
  </div>
  <span>期限開始</span>
  <div>
    <DateFormWithCalendar
      date={values.validFrom}
      on:value-change={onValidFromChange}
      {gengouList}
    />
  </div>
  <span>期限終了</span>
  <div>
    <DateFormWithCalendar
      date={values.validUpto}
      on:value-change={onValidUptoChange}
      {gengouList}
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
          bind:group={values.koureiStore}
          value={0}
          on:change={doUserInput}
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
          bind:group={values.koureiStore}
          value={w}
          on:change={doUserInput}
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
