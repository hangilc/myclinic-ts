<script lang="ts">
  import type { HokenType } from "@/cashier/patient-dialog/hoken";
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { genid } from "@/lib/genid";
  import { parseOptionalSqlDate, parseSqlDate } from "@/lib/util";
  import { intSrc, strSrc, type Invalid } from "@/lib/validator";
  import { dateSrc } from "@/lib/validators/date-validator";
  import { validateShahokokuho } from "@/lib/validators/shahokokuho-validator";
  import { toZenkaku } from "@/lib/zenkaku";
  import { HonninKazoku, Shahokokuho, type Patient } from "myclinic-model";
  import fold from "./fold";
  import { castHokenType } from "./misc";

  export let hoken: HokenType | undefined;
  export let patient: Patient;
  let shahokokuho: Shahokokuho | undefined = castHokenType<Shahokokuho>(hoken);

  function foldS<T>(someF: (some: Shahokokuho) => T, noneF: T): T {
    return fold(shahokokuho, someF, noneF);
  }
  let hokenshaBangou: string = foldS((h) => h.hokenshaBangou.toString(), "");
  let kigou: string = foldS((h) => h.hihokenshaKigou, "");
  let bangou: string = foldS((h) => h.hihokenshaBangou, "");
  let edaban: string = foldS((h) => h.edaban, "");
  let honninKazoku: number = foldS((h) => h.honninStore, 0);
  let validFrom: Date | null = foldS((h) => parseSqlDate(h.validFrom), null);
  let validFromErrors: Invalid[] = [];
  let validUpto: Date | null = foldS(
    (h) => parseOptionalSqlDate(h.validUpto),
    null
  );
  let validUptoErrors: Invalid[] = [];
  let kourei: number = foldS((h) => h.koureiStore, 0);

  export function validate(): HokenType | string[] {
    return validateShahokokuho(
      foldS((h) => h.shahokokuhoId, 0),
      {
        patientId: intSrc(patient.patientId),
        hokenshaBangou: intSrc(hokenshaBangou),
        hihokenshaKigou: strSrc(kigou),
        hihokenshaBangou: strSrc(bangou),
        honninStore: intSrc(honninKazoku),
        validFrom: dateSrc(validFrom, validFromErrors),
        validUpto: dateSrc(validUpto, validUptoErrors),
        koureiStore: intSrc(kourei),
        edaban: strSrc(edaban),
      }
    );
  }
</script>

<div class="panel">
  <span>({patient.patientId})</span>
  <span>{patient.fullName(" ")}</span>
  <span>保険者番号</span>
  <div><input type="text" class="regular" bind:value={hokenshaBangou} /></div>
  <span>記号・番号</span>
  <div>
    <input type="text" class="regular" bind:value={kigou} /> ・
    <input type="text" class="regular" bind:value={bangou} />
  </div>
  <span>枝番</span>
  <div><input type="text" class="edaban" bind:value={edaban} /></div>
  <span>本人・家族</span>
  <div>
    {#each Object.values(HonninKazoku) as h}
      {@const id = genid()}
      <input type="radio" {id} bind:group={honninKazoku} value={h.code} />
      <label for={id}>{h.rep}</label>
    {/each}
  </div>
  <span>期限開始</span>
  <div>
    <DateFormWithCalendar
      bind:date={validFrom}
      bind:errors={validFromErrors}
      isNullable={false}
    />
  </div>
  <span>期限終了</span>
  <div>
    <DateFormWithCalendar
      bind:date={validUpto}
      bind:errors={validUptoErrors}
      isNullable={true}
    />
  </div>
  <span>高齢</span>
  <div class="kourei">
    <div>
      {#if true}
        {@const id = genid()}
        <input type="radio" {id} class="radio" bind:group={kourei} value={0} />
        <label for={id}>高齢でない</label>
      {/if}
    </div>
    <div>
      {#each [1, 2, 3] as w}
        {@const id = genid()}
        <input type="radio" {id} class="radio" bind:group={kourei} value={w} />
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
