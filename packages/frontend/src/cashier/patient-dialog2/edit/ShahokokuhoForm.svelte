<script lang="ts">
  import type { HokenType } from "@/cashier/patient-dialog2/hoken";
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { genid } from "@/lib/genid";
  import { intSrc, strSrc, type Invalid } from "@/lib/validator";
  import { dateSrc } from "@/lib/validators/date-validator";
  import { validateShahokokuho } from "@/lib/validators/shahokokuho-validator";
  import { toZenkaku } from "@/lib/zenkaku";
  import { HonninKazoku, type Patient } from "myclinic-model";
  import type { ShahokokuhoInput } from "../shahokokuho-input";

  export let input: ShahokokuhoInput;
  export let patient: Patient;

  let validFromErrors: Invalid[] = [];
  let validUptoErrors: Invalid[] = [];

  export function validate(): HokenType | string[] {
    return validateShahokokuho(shahokokuhoId, {
      patientId: intSrc(patient.patientId),
      hokenshaBangou: intSrc(input.hokenshaBangou),
      hihokenshaKigou: strSrc(input.kigou),
      hihokenshaBangou: strSrc(input.bangou),
      honninStore: intSrc(input.honninKazoku),
      validFrom: dateSrc(input.validFrom, validFromErrors),
      validUpto: dateSrc(input.validUpto, validUptoErrors),
      koureiStore: intSrc(input.kourei),
      edaban: strSrc(input.edaban),
    });
  }
</script>

<div class="panel">
  <span>({patient.patientId})</span>
  <span>{patient.fullName(" ")}</span>
  <span>保険者番号</span>
  <div>
    <input type="text" class="regular" bind:value={input.hokenshaBangou} />
  </div>
  <span>記号・番号</span>
  <div>
    <input type="text" class="regular" bind:value={input.kigou} /> ・
    <input type="text" class="regular" bind:value={input.bangou} />
  </div>
  <span>枝番</span>
  <div><input type="text" class="edaban" bind:value={input.edaban} /></div>
  <span>本人・家族</span>
  <div>
    {#each Object.values(HonninKazoku) as h}
      {@const id = genid()}
      <input type="radio" {id} bind:group={input.honninKazoku} value={h.code} />
      <label for={id}>{h.rep}</label>
    {/each}
  </div>
  <span>期限開始</span>
  <div>
    <DateFormWithCalendar
      bind:date={input.validFrom}
      bind:errors={validFromErrors}
      isNullable={false}
    />
  </div>
  <span>期限終了</span>
  <div>
    <DateFormWithCalendar
      bind:date={input.validUpto}
      bind:errors={validUptoErrors}
      isNullable={true}
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
          bind:group={input.kourei}
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
          bind:group={input.kourei}
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
</style>
