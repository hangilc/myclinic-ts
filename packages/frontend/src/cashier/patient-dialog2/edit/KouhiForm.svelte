<script lang="ts">
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { parseOptionalSqlDate, parseSqlDate } from "@/lib/util";
  import { intSrc, type Invalid } from "@/lib/validator";
  import { dateSrc } from "@/lib/validators/date-validator";
  import { validateKouhi } from "@/lib/validators/kouhi-validator";
  import type { Kouhi, Patient } from "myclinic-model";
  import type { HokenType } from "../hoken";
  import fold from "./fold";
  import { castHokenType } from "./misc";

  export let hoken: HokenType | undefined;
  export let patient: Patient;
  let kouhi: Kouhi | undefined = castHokenType<Kouhi>(hoken);

  function foldK<T>(someF: (some: Kouhi) => T, noneF: T): T {
    return fold(kouhi, someF, noneF);
  }

  let futansha: string = foldK((k) => k.futansha.toString(), "");
  let jukyuusha: string = foldK((k) => k.jukyuusha.toString(), "");
  let validFrom: Date | null = foldK((k) => parseSqlDate(k.validFrom), null);
  let validFromErrors: Invalid[] = [];
  let validUpto: Date | null = foldK(
    (k) => parseOptionalSqlDate(k.validUpto),
    null
  );
  let validUptoErrors: Invalid[] = [];

  export function validate(): HokenType | string[] {
    return validateKouhi(kouhi?.kouhiId ?? 0, {
      patientId: intSrc(patient.patientId),
      futansha: intSrc(futansha),
      jukyuusha: intSrc(jukyuusha),
      validFrom: dateSrc(validFrom, validFromErrors),
      validUpto: dateSrc(validUpto, validUptoErrors),
    });
  }
</script>

<div class="panel">
  <span>({patient.patientId})</span>
  <span>{patient.fullName(" ")}</span>
  <span>負担者番号</span>
  <div><input type="text" class="regular" bind:value={futansha} /></div>
  <span>受給者番号</span>
  <div>
    <input type="text" class="regular" bind:value={jukyuusha} />
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
