<script lang="ts">
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { gengouListUpto } from "@/lib/gengou-list-upto";
  import { toInt, validResult, type VResult } from "@/lib/validation";
  import { validateKouhi } from "@/lib/validators/kouhi-validator";
  import type { Kouhi, Patient } from "myclinic-model";
  import { createEventDispatcher, onMount } from "svelte";
  import { KouhiFormValues } from "./kouhi-form-values";

  export let patient: Patient;
  export let data: Kouhi | null | undefined;
  let dispatch = createEventDispatcher<{
    "value-change": VResult<Kouhi>
    }>();
  let values: KouhiFormValues;
  $: onExternalData(data);
  onMount(() => onExternalData(data));
  let gengouList = gengouListUpto("平成");
  let validFromResult: VResult<Date | null>;
  let validUptoResult: VResult<Date | null>;

  function onExternalData(data: Kouhi | null | undefined){
    if( data !== undefined ){
      if( data === null ){
        values = KouhiFormValues.blank(patient.patientId);
      } else {
        values = KouhiFormValues.from(data);
        console.log("values", values);
        dispatch("value-change", validResult(data));
      }
      validFromResult = validResult(values.validFrom);
      validUptoResult = validResult(values.validUpto);
    }
  }

  export function validate(): VResult<Kouhi> {
    const input = {
      kouhiId: validResult(values.kouhiId),
      patientId: validResult(values.patientId),
      futansha: validResult(values.futansha).validate(toInt),
      jukyuusha: validResult(values.jukyuusha).validate(toInt),
      validFrom: validFromResult,
      validUpto: validUptoResult,
    }
    return validateKouhi(input);
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
  <span>負担者番号</span>
  <div>
    <input type="text" class="regular" bind:value={values.futansha} 
      on:change={doUserInput}/>
  </div>
  <span>受給者番号</span>
  <div>
    <input type="text" class="regular" bind:value={values.jukyuusha} on:change={doUserInput}/>
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
