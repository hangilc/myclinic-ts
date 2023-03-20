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
  import type { OnshiResult } from "onshi-result";
  import { onshi_query_from_hoken } from "@/lib/onshi-query-helper";
  import { dateToSql } from "@/lib/util";
  import { onshiConfirm } from "@/lib/onshi-confirm";
  import { Onshi } from "myclinic-model/model";

  export let destroy: () => void;
  export let patient: Patient;
  export let onEnter: (visit: Visit) => void;
  export let onCancel: () => void;
  export let at = new Date();
  export let shahokokuhoChecked: boolean = true;
  export let shahokokuhoOpt: Shahokokuho | undefined = undefined;
  export let shahokokuhoOnshi: OnshiResult | undefined = undefined;
  export let koukikoureiChecked: boolean = true;
  export let koukikoureiOpt: Koukikourei | undefined = undefined;
  export let koukikoureiOnshi: OnshiResult | undefined = undefined;
  export let kouhiList: Kouhi[] = [];
  export let inProgressNotice: string = "";
  export let error: string = "";

  queryHoken();

  $: needShahokokuhoOnshiConfirm =
    shahokokuhoOpt != undefined &&
    shahokokuhoChecked &&
    shahokokuhoOnshi == undefined;
  $: needKoukikoureiOnshiConfirm =
    koukikoureiOpt != undefined &&
    koukikoureiChecked &&
    koukikoureiOnshi == undefined;
  $: needOnshiConfirm =
    (needShahokokuhoOnshiConfirm && !needKoukikoureiOnshiConfirm) ||
    (!needShahokokuhoOnshiConfirm && needKoukikoureiOnshiConfirm);

  async function queryHoken() {
    inProgressNotice = "保険情報取得中";
    shahokokuhoOpt =
      (await api.findAvailableShahokokuho(patient.patientId, at)) ?? undefined;
    koukikoureiOpt =
      (await api.findAvailableKoukikourei(patient.patientId, at)) ?? undefined;
    kouhiList = await api.listAvailableKouhi(patient.patientId, at);
    inProgressNotice = "";
    if (shahokokuhoOpt != undefined && koukikoureiOpt != undefined) {
      error = "適用可能な保険が複数あります。修正してください。";
    }
  }

  async function doEnter() {
    const hokenIdSet = new HokenIdSet(
      shahokokuhoOpt && shahokokuhoChecked ? shahokokuhoOpt.shahokokuhoId : 0,
      koukikoureiOpt && koukikoureiChecked ? koukikoureiOpt.koukikoureiId : 0,
      0,
      kouhiList.length > 0 ? kouhiList[0].kouhiId : 0,
      kouhiList.length > 1 ? kouhiList[1].kouhiId : 0,
      kouhiList.length > 2 ? kouhiList[2].kouhiId : 0
    );
    if (hokenIdSet.shahokokuhoId > 0 && hokenIdSet.koukikoureiId > 0) {
      error =
        "複数の保険（社保国保と後期高齢）が設定されていますので、入力できません。";
      return;
    }
    let onshiResult: OnshiResult | undefined = undefined;
    if (hokenIdSet.shahokokuhoId > 0) {
      if (shahokokuhoOnshi) {
        onshiResult = shahokokuhoOnshi;
      } else {
        error = "社保国保の資格確認ができていません。";
        return;
      }
    }
    if (hokenIdSet.koukikoureiId > 0) {
      if (koukikoureiOnshi) {
        onshiResult = koukikoureiOnshi;
      } else {
        error = "後期高齢の資格確認ができていません。";
        return;
      }
    }
    if (onshiResult == undefined) {
      error = "資格確認ができていません。";
      return;
    } else {
      let visit: Visit | undefined = undefined;
      try {
        visit = await api.startVisitWithHoken(
          patient.patientId,
          at,
          hokenIdSet
        );
      } catch (e) {
        error = "診察の登録に失敗しました。";
        return;
      }
      if (visit) {
        if (onshiResult) {
          try {
            await api.enterOnshi(new Onshi(visit.visitId, JSON.stringify(onshiResult.origJson)));
          } catch (e) {
            error = "資格確認情報の登録に失敗しました。";
          }
        }
        destroy();
        onEnter(visit);
      }
    }
  }

  function doCancel() {
    destroy();
    onCancel();
  }

  async function doOnshiKakunin() {
    if (shahokokuhoOpt != undefined && koukikoureiOpt != undefined) {
      error =
        "適用できる社保国保と後期高齢が同時に存在します。修正してください。";
    } else {
      if (shahokokuhoOpt != undefined) {
        try {
          inProgressNotice = "オンライン資格確認中";
          const q = await onshi_query_from_hoken(
            shahokokuhoOpt,
            patient.birthday,
            dateToSql(at)
          );
          const result = await onshiConfirm(q);
          if (result.isValid && result.resultList.length === 1) {
            shahokokuhoOnshi = result;
          } else {
            error =
              "資格確認できませんでした。" +
              result.messageBody.qualificationValidity +
              (result.messageBody.processingResultMessage ?? "");
          }
        } catch (ex) {
          error = "資格確認サーバーに接続できませんでした。";
        } finally {
          inProgressNotice = "";
        }
      } else if (koukikoureiOpt != undefined) {
        try {
          inProgressNotice = "オンライン資格確認中";
          const q = await onshi_query_from_hoken(
            koukikoureiOpt,
            patient.birthday,
            dateToSql(at)
          );
          const result = await onshiConfirm(q);
          if (result.isValid && result.resultList.length === 1) {
            koukikoureiOnshi = result;
          } else {
            error =
              "資格確認できませんでした。" +
              result.messageBody.qualificationValidity +
              (result.messageBody.processingResultMessage ?? "");
          }
        } catch (ex) {
          error = "資格確認サーバーに接続できませんでした。";
        } finally {
          inProgressNotice = "";
        }
      }
    }
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
      {#if shahokokuhoOpt != undefined}
        <div>
          <label>
            <input type="checkbox" bind:checked={shahokokuhoChecked} />
            {shahokokuhoRep(shahokokuhoOpt)}
          </label>
          {#if shahokokuhoOnshi}
            <span class="onshi-confirmed-notice">資格確認済</span>
          {/if}
        </div>
      {/if}
      {#if koukikoureiOpt != undefined}
        <div>
          <label>
            <input type="checkbox" bind:checked={koukikoureiChecked} />
            {koukikoureiRep(koukikoureiOpt.futanWari)}
          </label>
          {#if koukikoureiOnshi}
            <span class="onshi-confirmed-notice">資格確認済</span>
          {/if}
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
    </div>
  </div>
  {#if inProgressNotice}
    <div class="in-progress-notice">{inProgressNotice}</div>
  {/if}
  {#if error}
    <div class="error">{error}</div>
  {/if}
  <div class="commands">
    {#if needOnshiConfirm}
      <button on:click={doOnshiKakunin}>資格確認</button>
    {:else}
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

  .in-progress-notice {
    color: green;
    text-align: center;
    margin: 10px 0;
  }

  .error {
    color: red;
    border: 1px solid red;
    margin: 10px 0;
    padding: 10px;
  }

  .onshi-confirmed-notice {
    color: green;
    font-weight: bold;
  }
</style>
