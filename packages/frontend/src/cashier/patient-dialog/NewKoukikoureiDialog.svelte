<script lang="ts">
  import api from "@/lib/api";
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { genid } from "@/lib/genid";
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import { intSrc, strSrc, type Invalid } from "@/lib/validator";
  import { dateSrc } from "@/lib/validators/date-validator";
  import { validateKoukikourei } from "@/lib/validators/koukikourei-validator";
  import { toZenkaku } from "@/lib/zenkaku";
  import { Koukikourei, type Patient } from "myclinic-model";
  import type { Readable } from "svelte/store";

  export let patient: Readable<Patient>;
  export let ops: {
    goback: () => void
  };
  let errors: string[] = [];
  let hokenshaBangou: string = "";
  let hihokenshaBangou: string = "";
  let futanWari: number = 1;
  let validFrom: Date | null = null;
  let validFromErrors: Invalid[] = [];
  let validUpto: Date | null = null;
  let validUptoErrors: Invalid[] = [];

  async function doEnter() {
    const result: Koukikourei | string[] = validateKoukikourei(0, {
      patientId: intSrc($patient.patientId),
      hokenshaBangou: strSrc(hokenshaBangou),
      hihokenshaBangou: strSrc(hihokenshaBangou),
      futanWari: intSrc(futanWari),
      validFrom: dateSrc(validFrom, validFromErrors),
      validUpto: dateSrc(validUpto, validUptoErrors),
    });
    if( result instanceof Koukikourei ){
      await api.enterKoukikourei(result);
      ops.goback();
    } else {
      errors = result;
    }
  }
</script>

<SurfaceModal title="新規後期高齢" destroy={ops.goback}>
  {#if errors.length > 0}
    <div class="error">
      {#each errors as e}
        <div>{e}</div>
      {/each}
    </div>
  {/if}
  <div class="panel">
    <span>({$patient.patientId})</span>
    <span>{$patient.fullName(" ")}</span>
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
    <button on:click={ops.goback}>キャンセル</button>
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
