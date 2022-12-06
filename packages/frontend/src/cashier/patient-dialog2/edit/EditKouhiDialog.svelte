<script lang="ts">
  import api from "@/lib/api";
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { genid } from "@/lib/genid";
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import { parseOptionalSqlDate, parseSqlDate } from "@/lib/util";
  import { intSrc, strSrc, type Invalid } from "@/lib/validator";
  import { dateSrc } from "@/lib/validators/date-validator";
  import { validateKouhi } from "@/lib/validators/kouhi-validator";
  import { toZenkaku } from "@/lib/zenkaku";
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
  let hokenshaBangou: string = foldK(k => k.hokenshaBangou, "");
  let hihokenshaBangou: string = foldK(k => k.hihokenshaBangou, "");
  let futanWari: number = kouhi?.futanWari ?? 1;
  let validFrom: Date | null = foldK(k => parseSqlDate(k.validFrom), null);
  let validFromErrors: Invalid[] = [];
  let validUpto: Date | null = foldK(k => parseOptionalSqlDate(k.validUpto), null);
  let validUptoErrors: Invalid[] = [];
  
  let title: string = isCreation ? "新規後期高齢" : "後期高齢編集";

  function checkCreation(s: Kouhi | undefined): boolean {
    return fold(s, s => s.kouhiId === 0, false);
  }
  
  function close(): void {
    destroy();
    data.goback();
  }

  async function doEnter() {
    const result: Kouhi | string[] = validateKouhi(
      kouhi?.kouhiId ?? 0, {
      patientId: intSrc(patient.patientId),
      hokenshaBangou: strSrc(hokenshaBangou),
      hihokenshaBangou: strSrc(hihokenshaBangou),
      futanWari: intSrc(futanWari),
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

<SurfaceModal destroy={close} {title}>
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
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={close}>キャンセル</button>
  </div>
</SurfaceModal>