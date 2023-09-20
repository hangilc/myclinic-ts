<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import type { OnshiResult } from "onshi-result";
  import * as kanjidate from "kanjidate";
  import OnshiKakuninFormItem from "./OnshiKakuninFormItem.svelte";
  import { onshiDateToSqlDate } from "onshi-result/util";
  import type { Koukikourei, Patient, Shahokokuho } from "myclinic-model";
  import { onshiConfirm, type OnshiKakuninQuery } from "./onshi-confirm";
  import { onshi_query_from_hoken } from "./onshi-query-from-hoken";
  import { OnshiInconsistency, checkOnshiInconsistency } from "./onshi-inconsistency";
  import api from "./api";

  export let destroy: () => void;
  export let hoken: Shahokokuho | Koukikourei;
  export let confirmDate: string;
  export let onOnshiNameUpdated: (updated: Patient) => void;
  let result: OnshiResult | undefined = undefined;
  let errors: string[] = [];
  let announce: string = "";
  let query: OnshiKakuninQuery | undefined = undefined;
  let showDetail = false;
  let updateOnshiNameData: undefined | {
    patientId: number,
    onshiName: string
  } = undefined;

  startQuery();

  async function startQuery() {
    announce = "問い合わせ中";
    try {
      const patient = await getPatient();
      const query = onshi_query_from_hoken(
        hoken,
        patient.birthday,
        confirmDate
      );
      result = await onshiConfirm(query);
      announce = "";
      if (result.isValid) {
        const ri = result.resultList[0];
        const e = checkOnshiInconsistency(ri, patient, hoken);
        if (e.length > 0) {
          errors = e.map((e) => e.toString());
          if( hasPatientNameInconsistency(e) && countPatientInconsistencies(e) === 1 ){
            updateOnshiNameData = {
              patientId: patient.patientId,
              onshiName: ri.name,
            };
          }
        } else {
          errors = [];
          announce = "資格確認成功";
        }
      } else {
        errors = ["オンライン資格確認に失敗しました。"];
      }
    } catch (ex: any) {
      errors = ["資格確認サーバー問い合わせエラー。", ex.toString()];
    }
  }

  function countPatientInconsistencies(errs: OnshiInconsistency[]): number {
    return errs.reduce((acc, ele) => {
      const kind = ele.kind;
      if( kind.startsWith("patient-") ){
        return acc + 1;
      } else {
        return acc;
      }
    }, 0);
  }

  function hasPatientNameInconsistency(errs: OnshiInconsistency[]): boolean {
    for(let e of errs){
      if( e.kind === "patient-name" ){
        return true;
      }
    }
    return false;
  }

  async function getPatient(): Promise<Patient> {
    const patientId = hoken.patientId;
    return await api.getPatient(patientId);
  }

  function doClose(): void {
    destroy();
  }

  function formatOnshiDate(arg: string): string {
    const sql = onshiDateToSqlDate(arg);
    return kanjidate.format(kanjidate.f2, sql);
  }

  async function doSetOnshiName() {
    if( updateOnshiNameData ){
      const d = updateOnshiNameData;
      const patient = await api.getPatient(d.patientId);
      const m = patient.memoAsJson;
      m["onshi-name"] = d.onshiName;
      patient.memo = JSON.stringify(m);
      await api.updatePatient(patient);
      destroy();
      onOnshiNameUpdated(patient);
    }
  }
</script>

<Dialog title="オンライン資格確認" destroy={doClose} styleWidth="300px">
  <div class="query">
    {#if query}
      <span>保険者番号</span><span>{query.hokensha}</span>
      {#if query.kigou}
        <span>被保険者記号</span><span>{query.kigou}</span>
      {/if}
      <span>被保険者番号</span><span>{query.hihokensha}</span>
      <span>生年月日</span><span>{formatOnshiDate(query.birthdate)}</span>
      <span>確認日</span><span>{formatOnshiDate(query.confirmationDate)}</span>
    {/if}
  </div>
  {#if errors.length > 0}
    <div class="error">
      {#each errors as error}<div>{error}</div>{/each}
    </div>
  {/if}
  {#if announce}<div class="announce">{announce}</div>{/if}
  {#if updateOnshiNameData}
  <div class="update-onshi-name-wrapper">
    この名前をオンライン資格確認の際には使用しますか？
    <button data-cy="update-onshi-name-button" on:click={doSetOnshiName}>はい</button>
  </div>
  {/if}
  <slot name="commands">
    <div class="commands">
      <button on:click={doClose}>閉じる</button>
    </div>
  </slot>
  {#if result && result.resultList.length === 1}
    <div class="detail-wrapper">
      <div class="detail-toggle">
        <span>確認情報詳細</span>
        {#if !showDetail}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="gray"
          width="16"
          on:click={() => { showDetail = true}}
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
        {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="gray"
          width="16"
          on:click={() => { showDetail = false}}
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4.5 15.75l7.5-7.5 7.5 7.5"
          />
        </svg>
        {/if}
      </div>
    </div>
    {#if showDetail}
      <div class="result-wrapper">
        <div class="query-result">
          <OnshiKakuninFormItem result={result.resultList[0]} />
        </div>
      </div>
    {/if}
  {/if}
</Dialog>

<style>
  .query {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .query span:nth-of-type(even) {
    margin-left: 10px;
  }

  .commands {
    margin-top: 10px;
    text-align: right;
  }

  .query-result {
    border: 1px solid green;
    padding: 10px;
    margin: 10px 0;
  }

  .error {
    border: 1px solid red;
    padding: 10px;
    color: red;
    margin: 10px 0;
  }

  .result-wrapper {
    max-height: 300px;
    overflow-y: auto;
    padding: 6px;
  }

  .announce {
    margin: 10px 0;
  }

  .update-onshi-name-wrapper {
    margin: 10px 0;
    border: 1px solid gray;
    border-radius: 4px;
    padding: 10px;
  }
</style>
