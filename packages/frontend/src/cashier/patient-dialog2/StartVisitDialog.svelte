<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import {
    HokenIdSet,
    Kouhi,
    Koukikourei,
    Shahokokuho,
    Visit,
    type Patient,
  } from "myclinic-model";
  import * as kanjidate from "kanjidate";
  import { kouhiRep, koukikoureiRep, shahokokuhoRep } from "@/lib/hoken-rep";

  export let destroy: () => void;
  export let patient: Patient;
  export let onEnter: (visit: Visit) => void;
  export let onCancel: () => void;
  export let queryingHoken: boolean = true;
  export let at = new Date();
  export let shahokokuhoOpt: Shahokokuho | undefined = undefined;
  export let koukikoureiOpt: Koukikourei | undefined = undefined;
  export let kouhiList: Kouhi[] = [];
  export let shahokokuhoChecked: boolean = false;
  export let koukikoureiChecked: boolean = false;

  queryHoken();

  async function queryHoken() {
    shahokokuhoOpt =
      (await api.findAvailableShahokokuho(patient.patientId, at)) ?? undefined;
    if (shahokokuhoOpt == undefined) {
      koukikoureiOpt =
        (await api.findAvailableKoukikourei(patient.patientId, at)) ??
        undefined;
      koukikoureiChecked = true;
    } else {
      shahokokuhoChecked = true;
    }
    kouhiList = await api.listAvailableKouhi(patient.patientId, at);
    queryingHoken = false;
  }

  async function doEnter() {
    let shahokokuhoId: number = 0;
    let koukikoureiId: number = 0;
    if( shahokokuhoOpt != undefined && shahokokuhoChecked ){

    } else if( koukikoureiOpt != undefined && koukikoureiChecked ){

    }
    const hokenIdSet = new HokenIdSet(0, 0, 0, 0, 0, 0);
    const visit = await api.startVisitWithHoken(
      patient.patientId,
      at,
      hokenIdSet
    );
    destroy();
    onEnter(visit);
  }

  function doCancel() {
    destroy();
    onCancel();
  }

  function formatBirthday(birthday: string): string {
    const d = new Date(birthday);
    const age = kanjidate.calcAge(d);
    return `${kanjidate.format(kanjidate.f2, d)}（${age}才）`;
  }
</script>

<Dialog destroy={doCancel} title="診察受付" styleWidth="300px">
  <div class="patient-panel">
    <span>患者番号</span><span>{patient.patientId}</span>
    <span>氏名</span><span>{patient.fullName()}</span>
    <span>生年月日</span><span>{formatBirthday(patient.birthday)}</span>
    <span>性別</span><span>{patient.sexAsKanji}性</span>
    <span>保険</span>
    <div class="hoken-area">
      {#if !queryingHoken}
        {#if shahokokuhoOpt != undefined}
          <div>
            <label>
              <input type="checkbox" bind:checked={shahokokuhoChecked} />
              {shahokokuhoRep(shahokokuhoOpt)}
            </label>
          </div>
        {/if}
        {#if koukikoureiOpt != undefined}
          <div>
            <label>
              <input type="checkbox" bind:checked={koukikoureiChecked} />
              {koukikoureiRep(koukikoureiOpt.futanWari)}
            </label>
          </div>
        {/if}
        {#each kouhiList as kouhi (kouhi.kouhiId)}
          <div>
            <label>
              <input type="checkbox" checked />
              {kouhiRep(kouhi.futansha)}
            </label>
          </div>
        {/each}
      {/if}
    </div>
  </div>
  {#if queryingHoken}
    <div class="querying-hoken-notice">保険問い合わせ中</div>
  {/if}
  <div class="commands">
    {#if !queryingHoken}
      <button on:click={doEnter}>入力</button>
    {/if}
    <button on:click={doCancel}>キャンセル</button>
  </div>
</Dialog>

<style>
  .patient-panel {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .patient-panel > *:nth-child(odd) {
    text-align: right;
  }

  .patient-panel > *:nth-child(even) {
    margin-left: 10px;
  }

  .hoken-area {
    display: inline-block;
  }

  .commands {
    display: flex;
    justify-content: right;
    margin-top: 10px;
  }

  .commands * + button {
    margin-left: 4px;
  }

  .querying-hoken-notice {
    color: green;
    text-align: center;
    margin: 10px 0;
  }
</style>
