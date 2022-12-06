<script lang="ts">
  import api from "@/lib/api";
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { genid } from "@/lib/genid";
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import { parseOptionalSqlDate, parseSqlDate } from "@/lib/util";
  import { intSrc, strSrc, type Invalid } from "@/lib/validator";
  import { dateSrc } from "@/lib/validators/date-validator";
  import { validateShahokokuho } from "@/lib/validators/shahokokuho-validator";
  import { toZenkaku } from "@/lib/zenkaku";
  import { HonninKazoku, Shahokokuho, type Patient } from "myclinic-model";
  import type { Hoken } from "../hoken";
  import type { PatientData } from "../patient-data";
  import fold from "./fold";

  export let data: PatientData;
  export let hoken: Hoken | undefined;
  export let destroy: () => void;
  let shahokokuho: Shahokokuho | undefined = hoken?.asShahokokuho;
  let patient: Patient = data.patient;

  const isCreation: boolean = checkCreation(shahokokuho);

  function foldS<T>(someF: (some: Shahokokuho) => T, noneF: T): T {
    return fold(shahokokuho, someF, noneF);
  }
  let errors: string[] = [];
  let hokenshaBangou: string = foldS(h => h.hokenshaBangou.toString(), "");
  let kigou: string = foldS(h => h.hihokenshaKigou, "");
  let bangou: string = foldS(h => h.hihokenshaBangou, "");
  let edaban: string = foldS(h => h.edaban, "");
  let honninKazoku: number = foldS(h => h.honninStore,  0);
  let validFrom: Date | null = foldS(h => parseSqlDate(h.validFrom), null);
  let validFromErrors: Invalid[] = [];
  let validUpto: Date | null = foldS(h => parseOptionalSqlDate(h.validUpto), null);
  let validUptoErrors: Invalid[] = [];
  let kourei: number = foldS(h => h.koureiStore,  0);
  
  let title: string = isCreation ? "新規社保国保" : "社保国保編集";

  function checkCreation(s: Shahokokuho | undefined): boolean {
    return fold(s, s => s.shahokokuhoId === 0, false);
  }

  function close(): void {
    destroy();
    data.goback();
  }

  async function doEnter() {
    const result: Shahokokuho | string[] = validateShahokokuho(
      foldS(h => h.shahokokuhoId, 0),
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
    if (result instanceof Shahokokuho) {
      if( isCreation ){
        const entered = await api.enterShahokokuho(result);
        data.hokenCache.enterHokenType(entered);
      } else {
        await api.updateShahokokuho(result);
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
          <input
            type="radio"
            {id}
            class="radio"
            bind:group={kourei}
            value={0}
          />
          <label for={id}>高齢でない</label>
        {/if}
      </div>
      <div>
        {#each [1, 2, 3] as w}
          {@const id = genid()}
          <input type="radio" {id} class="radio" value={w} />
          <label for={id}>{toZenkaku(w.toString())}割</label>
        {/each}
      </div>
    </div>
  </div>
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={close}>キャンセル</button>
  </div>
</SurfaceModal>

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

  .commands {
    display: flex;
    justify-content: right;
    margin-top: 10px;
  }

  .commands > * + * {
    margin-left: 4px;
  }

  .error {
    color: red;
  }
</style>
