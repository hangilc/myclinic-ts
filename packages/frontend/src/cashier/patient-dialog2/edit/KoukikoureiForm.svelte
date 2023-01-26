<script lang="ts">
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { gengouListUpto } from "@/lib/gengou-list-upto";
  import { genid } from "@/lib/genid";
  import { validResult, type VResult } from "@/lib/validation";
  import { validateKoukikourei } from "@/lib/validators/koukikourei-validator";
  import { toZenkaku } from "@/lib/zenkaku";
  import type { Koukikourei, Patient } from "myclinic-model";
  import { createEventDispatcher, onMount } from "svelte";
  import { KoukikoureiFormValues } from "./koukikourei-form-values";

  export let patient: Patient;
  export let data: Koukikourei | null | undefined;
  let dispatch = createEventDispatcher<{
    "value-change": VResult<Koukikourei>
    }>();
  let values: KoukikoureiFormValues;
  $: onExternalData(data);
  onMount(() => onExternalData(data));
  let gengouList = gengouListUpto("平成");
  let validFromResult: VResult<Date | null>;
  let validUptoResult: VResult<Date | null>;

  function onExternalData(data: Koukikourei | null | undefined){
    if( data !== undefined ){
      if( data === null ){
        values = KoukikoureiFormValues.blank(patient.patientId);
      } else {
        values = KoukikoureiFormValues.from(data);
        console.log("values", values);
        dispatch("value-change", validResult(data));
      }
      validFromResult = validResult(values.validFrom);
      validUptoResult = validResult(values.validUpto);
    }
  }

  export function validate(): VResult<Koukikourei> {
    const input = {
      koukikoureiId: validResult(values.koukikoureiId),
      patientId: validResult(values.patientId),
      hokenshaBangou: validResult(values.hokenshaBangou),
      hihokenshaBangou: validResult(values.hihokenshaBangou),
      futanWari: validResult(values.futanWari),
      validFrom: validFromResult,
      validUpto: validUptoResult,
    }
    return validateKoukikourei(input);
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
    <input type="text" class="regular" bind:value={values.hokenshaBangou} 
      on:change={doUserInput}/>
  </div>
  <span>被保険者番号</span>
  <div>
    <input type="text" class="regular" bind:value={values.hihokenshaBangou} on:change={doUserInput}/>
  </div>
  <span>負担割</span>
  <div>
    {#each [1, 2, 3] as w}
      {@const id = genid()}
      <input type="radio" value={w} bind:group={values.futanWari} on:change={doUserInput}/>
      <label for={id}>{toZenkaku(w.toString())}割</label>
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
