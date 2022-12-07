<script lang="ts">
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { genid } from "@/lib/genid";
  import { parseOptionalSqlDate, parseSqlDate } from "@/lib/util";
  import { intSrc, strSrc, type Invalid } from "@/lib/validator";
  import { dateSrc } from "@/lib/validators/date-validator";
  import { validateKoukikourei } from "@/lib/validators/koukikourei-validator";
  import { toZenkaku } from "@/lib/zenkaku";
  import type { Koukikourei, Patient } from "myclinic-model";
  import type { HokenType } from "../hoken";
  import fold from "./fold";
  import { castHokenType } from "./misc";

  export let hoken: HokenType | undefined;
  export let patient: Patient;
  let koukikourei: Koukikourei | undefined = castHokenType<Koukikourei>(hoken);

  function foldK<T>(someF: (some: Koukikourei) => T, noneF: T): T {
    return fold(koukikourei, someF, noneF);
  }

  let hokenshaBangou: string = foldK((k) => k.hokenshaBangou, "");
  let hihokenshaBangou: string = foldK((k) => k.hihokenshaBangou, "");
  let futanWari: number = koukikourei?.futanWari ?? 1;
  let validFrom: Date | null = foldK((k) => parseSqlDate(k.validFrom), null);
  let validFromErrors: Invalid[] = [];
  let validUpto: Date | null = foldK(
    (k) => parseOptionalSqlDate(k.validUpto),
    null
  );
  let validUptoErrors: Invalid[] = [];

  export function validate(): HokenType | string[] {
    return validateKoukikourei(koukikourei?.koukikoureiId ?? 0, {
      patientId: intSrc(patient.patientId),
      hokenshaBangou: strSrc(hokenshaBangou),
      hihokenshaBangou: strSrc(hihokenshaBangou),
      futanWari: intSrc(futanWari),
      validFrom: dateSrc(validFrom, validFromErrors),
      validUpto: dateSrc(validUpto, validUptoErrors),
    });
  }
</script>

<div class="panel">
  <span>({patient.patientId})</span>
  <span>{patient.fullName(" ")}</span>
  <span>保険者番号</span>
  <div><input type="text" class="regular" bind:value={hokenshaBangou} /></div>
  <span>被保険者番号</span>
  <div>
    <input type="text" class="regular" bind:value={hihokenshaBangou} />
  </div>
  <span>負担割</span>
  <div>
    {#each [1, 2, 3] as w}
      {@const id = genid()}
      <input type="radio" value={w} bind:group={futanWari} />
      <label for={id}>{toZenkaku(w.toString())}割</label>
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
</style>
