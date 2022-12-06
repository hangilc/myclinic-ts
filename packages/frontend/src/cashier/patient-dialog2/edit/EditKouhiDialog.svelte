<script lang="ts">
  import api from "@/lib/api";
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { genid } from "@/lib/genid";
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import { parseOptionalSqlDate, parseSqlDate } from "@/lib/util";
  import { intSrc, strSrc, type Invalid } from "@/lib/validator";
  import { dateSrc } from "@/lib/validators/date-validator";
  import { validateKouhi } from "@/lib/validators/kouhi-validator";
  import { Kouhi, type Patient } from "myclinic-model";
  import type { Hoken } from "../hoken";
  import type { PatientData } from "../patient-data";
  import fold from "./fold";

  export let data: PatientData;
  export let hoken: Hoken | undefined;
  export let destroy: () => void;
  let kouhi: Kouhi | undefined = hoken?.asKouhi;
  let patient: Patient = data.patient;
  const isCreation: boolean = checkCreation(kouhi);

  function foldK<T>(someF: (some: Kouhi) => T, noneF: T): T {
    return fold(kouhi, someF, noneF);
  }

  let errors: string[] = [];
  let futansha: string = foldK(k => k.futansha.toString(), "");
  let jukyuusha: string = foldK(k => k.jukyuusha.toString(), "");
  let validFrom: Date | null = foldK(k => parseSqlDate(k.validFrom), null);
  let validFromErrors: Invalid[] = [];
  let validUpto: Date | null = foldK(k => parseOptionalSqlDate(k.validUpto), null);
  let validUptoErrors: Invalid[] = [];
  
  let title: string = isCreation ? "新規公費" : "公費編集";

  function checkCreation(s: Kouhi | undefined): boolean {
    return fold(s, s => s.kouhiId === 0, false);
  }
  
  function close(): void {
    destroy();
    data.goback();
  }

  function exit(): void {
    destroy();
    data.exit();
  }

  async function doEnter() {
    const result: Kouhi | string[] = validateKouhi(
      kouhi?.kouhiId ?? 0, {
      patientId: intSrc(patient.patientId),
      futansha: intSrc(futansha),
      jukyuusha: intSrc(jukyuusha),
      validFrom: dateSrc(validFrom, validFromErrors),
      validUpto: dateSrc(validUpto, validUptoErrors),
    });
    if( result instanceof Kouhi ){
      if( isCreation ){
        const entered = await api.enterKouhi(result);
        data.hokenCache.enterHokenType(entered);
      } else {
        await api.updateKouhi(result);
        data.hokenCache.updateWithHokenType(result);
      }
      close();
    } else {
      errors = result;
    }
  }
</script>

<SurfaceModal destroy={exit} {title}>
  {#if errors.length > 0}
    <div class="error">
      {#each errors as e}
        <div>{e}</div>
      {/each}
    </div>
  {/if}
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
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={close}>キャンセル</button>
  </div>
</SurfaceModal>