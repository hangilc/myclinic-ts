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

</script>

<SurfaceModal {destroy}>
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
    <div><input type="text" /></div>
    <span>記号・番号</span>
    <div>
      <input type="text" /> ・ <input type="text" />
    </div>
    <span>枝番</span>
    <div><input type="text" /></div>
    <span>本人・家族</span>
    <div>
      {#each Object.values(HonninKazoku) as h}
        {@const id=genid()}
        <input type="radio" {id}/>
        <label for={id}>{h.rep}</label>
      {/each}
    </div>
    <span>期限開始</span>
    <div><DateFormWithCalendar date={null} isNullable={false}/></div>
    <span>期限終了</span>
    <div><DateFormWithCalendar date={null} isNullable={true} /></div>
    <span>高齢</span>
    <div>
      <div>
        {#if true}
        {@const id=genid()}
        <input type="radio" {id}/>
        <label for={id}>高齢でない</label>
        {/if}
      </div>
      <div>
        {#each [1,2,3] as w}
        {@const id=genid()}
        <input type="radio" {id}/>
        <label for={id}>{toZenkaku(w.toString())}割</label>
        {/each}
      </div>
    </div>
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
    text-align: right;
  }
</style>