<script lang="ts">
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { genid } from "@/lib/genid";
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import type { Invalid } from "@/lib/validator";
  import { toZenkaku } from "@/lib/zenkaku";
  import type { Patient } from "myclinic-model";
  import { HonninKazoku } from "myclinic-model/model";
  import type { Readable } from "svelte/store";

  export let patient: Readable<Patient>;
  export let destroy: () => void;
  export let errors: Invalid[] = [];
  let hokenshaBangou: string = "";
  let kigou: string = "";
  let bangou: string = "";
  let edaban: string = "";
  let honninKazoku: number = 0;
  let validFrom: Date | null = null;
  let validFromErrors: Invalid[] = [];
  let validUpto: Date | null = null;
  let validUptoErrors: Invalid[] = [];
  let kourei: number = 0;

  async function doEnter() {
    
  }
</script>

<SurfaceModal {destroy} title="新規社保国保入力">
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
          <input type="radio" {id} class="radio" bind:group={kourei} value={0}/>
          <label for={id}>高齢でない</label>
        {/if}
      </div>
      <div>
        {#each [1, 2, 3] as w}
          {@const id = genid()}
          <input type="radio" {id} class="radio" value={w}/>
          <label for={id}>{toZenkaku(w.toString())}割</label>
        {/each}
      </div>
    </div>
  </div>
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={destroy}>キャンセル</button>
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
