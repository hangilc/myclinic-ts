<script lang="ts">
  import api from "@/lib/api";
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import { parseOptionalSqlDate, parseSqlDate } from "@/lib/util";
  import { intSrc, type Invalid } from "@/lib/validator";
  import { dateSrc } from "@/lib/validators/date-validator";
  import { validateKouhi } from "@/lib/validators/kouhi-validator";
  import { Kouhi, type Patient } from "myclinic-model";
  import type { Readable } from "svelte/store";

  export let patient: Readable<Patient>;
  export let title: string;
  export let ops: {
    goback: () => void
  };
  export let kouhi: Kouhi | undefined;
  export let onEnter: (k: Kouhi) => void;

  let errors: string[] = [];
  let futansha: string = kouhi?.futansha.toString() ?? "";
  let jukyuusha: string = kouhi?.jukyuusha.toString() ?? "";
  let validFrom: Date | null = 
    kouhi !== undefined ? parseSqlDate(kouhi.validFrom) : null;
  let validFromErrors: Invalid[] = [];
  let validUpto: Date | null = 
    kouhi !== undefined ? parseOptionalSqlDate(kouhi.validUpto) : null;
  let validUptoErrors: Invalid[] = [];

  async function doEnter() {
    const result: Kouhi | string[] = validateKouhi(
      kouhi?.kouhiId ?? 0, {
      patientId: intSrc($patient.patientId),
      futansha: intSrc(futansha),
      jukyuusha: intSrc(jukyuusha),
      validFrom: dateSrc(validFrom, validFromErrors),
      validUpto: dateSrc(validUpto, validUptoErrors),
    });
    if( result instanceof Kouhi ){
      onEnter(result);
    } else {
      errors = result;
    }
  }
</script>

<SurfaceModal {title} destroy={ops.goback}>
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
