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
  import { type Patient, Shahokokuho } from "myclinic-model";
  import { HonninKazoku } from "myclinic-model/model";
  import type { Readable } from "svelte/store";

  export let patient: Readable<Patient>;
  export let ops: {
    goback: () => void;
  };
  export let shahokokuho: Shahokokuho | undefined;
  export let onEnter: (s: Shahokokuho) => void;
  export let title: string;

  let errors: string[] = [];
  let hokenshaBangou: string = shahokokuho?.hokenshaBangou.toString() ?? "";
  let kigou: string = shahokokuho?.hihokenshaKigou ?? "";
  let bangou: string = shahokokuho?.hihokenshaBangou ?? "";
  let edaban: string = shahokokuho?.edaban ?? "";
  let honninKazoku: number = shahokokuho?.honninStore ?? 0;
  let validFrom: Date | null =
    shahokokuho != undefined ? parseSqlDate(shahokokuho.validFrom) : null;
  let validFromErrors: Invalid[] = [];
  let validUpto: Date | null =
    shahokokuho != undefined
      ? parseOptionalSqlDate(shahokokuho.validUpto)
      : null;
  let validUptoErrors: Invalid[] = [];
  let kourei: number = shahokokuho?.koureiStore ?? 0;

  async function doEnter() {
    const result: Shahokokuho | string[] = validateShahokokuho(
      shahokokuho?.shahokokuhoId ?? 0,
      {
        patientId: intSrc($patient.patientId),
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
      onEnter(result);
    } else {
      errors = result;
    }
  }
</script>

<SurfaceModal destroy={ops.goback} {title}>
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
