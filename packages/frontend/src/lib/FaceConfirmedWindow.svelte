<script lang="ts">
  import Floating from "@/lib/Floating.svelte";
  import type { OnshiResult } from "onshi-result";
  import * as kanjidate from "kanjidate";
  import { convertHankakuKatakanaToZenkakuHiragana } from "./zenkaku";
  import api from "./api";
  import {
    dateToSqlDateTime,
    HokenIdSet,
    Koukikourei,
    Onshi,
    Shahokokuho,
    type Kouhi,
    type Patient,
  } from "myclinic-model";
  import { AllResolved, MultiplePatients } from "./face-confirm-window";
  import {
    koukikoureiOnshiConsistent,
    shahokokuhoOnshiConsistent,
  } from "./hoken-onshi-consistent";
  import type { ResultOfQualificationConfirmation } from "onshi-result/ResultOfQualificationConfirmation";
  import ChoosePatientDialog from "./ChoosePatientDialog.svelte";

  export let destroy: () => void;
  export let result: OnshiResult;
  export let onRegister: () => void = () => {};

  const style =
    "width:360px;padding:6px;border:1px solid blue;opacity:1;background-color:white;left:100px;top:100px;";
  let yomi: string = result.messageBody.nameKana
    ? toZenkaku(result.messageBody.nameKana)
    : "";
  let resolvedState: undefined | AllResolved | MultiplePatients = undefined;
  let message: string = "";

  resolvePatient();

  function toZenkaku(s: string): string {
    return convertHankakuKatakanaToZenkakuHiragana(s);
  }

  function formatDate(s: string): string {
    return kanjidate.format(kanjidate.f2, s);
  }

  async function searchPatient(
    name: string,
    yomi: string,
    birthdate: string
  ): Promise<Patient[]> {
    let patients: Patient[] = (await api.searchPatient(name)).filter(
      (p) => name === `${p.lastName}　${p.firstName}`
    );
    if (yomi !== "") {
      let yomiPatients = await api.searchPatient(yomi);
      yomiPatients
        .filter((p) => yomi === `${p.lastNameYomi} ${p.firstNameYomi}`)
        .filter((p) => {
          return patients.findIndex((a) => a.patientId === p.patientId) < 0;
        })
        .forEach((p) => patients.push(p));
    }
    return patients.filter((p) => p.birthday === birthdate);
  }

  async function advance(
    patient: Patient,
    r: ResultOfQualificationConfirmation
  ) {
    const now = dateToSqlDateTime(new Date());
    const shahoOpt =
      (await api.findAvailableShahokokuho(patient.patientId, now)) ?? undefined;
    const koukiOpt =
      (await api.findAvailableKoukikourei(patient.patientId, now)) ?? undefined;
    const kouhiList: Kouhi[] = await api.listAvailableKouhi(
      patient.patientId,
      now
    );
    if (shahoOpt && !koukiOpt) {
      console.log("shaho", shahoOpt);
      console.log("r", r);
      const err = shahokokuhoOnshiConsistent(shahoOpt, r);
      if (!err) {
        resolvedState = new AllResolved(
          patient,
          shahoOpt,
          kouhiList,
          result,
          now
        );
      } else {
        message = err;
      }
    } else if (koukiOpt && !shahoOpt) {
      const err = koukikoureiOnshiConsistent(koukiOpt, r);
      if (!err) {
        resolvedState = new AllResolved(
          patient,
          koukiOpt,
          kouhiList,
          result,
          now
        );
      } else {
        message = "保険情報が資格確認情報と一致しません。";
      }
    } else if (!shahoOpt && !koukiOpt) {
      message = "現在有効な登録保険情報が存在しません。";
    } else {
      message = "現在有効な登録保険情報が複数存在します。";
    }
  }

  async function resolvePatient() {
    const name = result.messageBody.name;
    const yomi = convertHankakuKatakanaToZenkakuHiragana(
      result.messageBody.nameKana ?? ""
    );
    if (result.resultList.length === 1) {
      const r = result.resultList[0];
      const birthdate = r.birthdate;
      const patients = await searchPatient(name, yomi, birthdate);
      console.log("patients", patients);
      if (patients.length === 1) {
        message = "";
        advance(patients[0], r);
      } else if (patients.length === 0) {
        message = "該当する登録患者情報がありません。";
      } else {
        message = "該当する登録患者情報が複数あります。";
        resolvedState = new MultiplePatients(patients, r);
      }
    } else if (result.resultList.length === 0) {
      message = "確認された保険情報がありません。";
    } else {
      message = "確認された保険情報が複数あります。";
    }
  }

  async function doRegister(resolved: AllResolved) {
    const at = resolved.at;
    const shahokokuhoId =
      resolved.hoken instanceof Shahokokuho ? resolved.hoken.shahokokuhoId : 0;
    const koukikoureiId =
      resolved.hoken instanceof Koukikourei ? resolved.hoken.koukikoureiId : 0;
    const kouhi1Id =
      resolved.kouhiList.length > 0 ? resolved.kouhiList[0].kouhiId : 0;
    const kouhi2Id =
      resolved.kouhiList.length > 1 ? resolved.kouhiList[1].kouhiId : 0;
    const kouhi3Id =
      resolved.kouhiList.length > 2 ? resolved.kouhiList[2].kouhiId : 0;
    const hokenIdSet = new HokenIdSet(
      shahokokuhoId,
      koukikoureiId,
      0,
      kouhi1Id,
      kouhi2Id,
      kouhi3Id
    );
    const visit = await api.startVisitWithHoken(
      resolved.patient.patientId,
      at,
      hokenIdSet
    );
    await api.setOnshi(
      new Onshi(visit.visitId, JSON.stringify(resolved.onshiResult.origJson))
    );
    onRegister();
  }

  function doChoosePatient(patients: Patient[], r: ResultOfQualificationConfirmation) {
    const d: ChoosePatientDialog = new ChoosePatientDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        patients,
        onSelect: (selected: Patient | undefined) => {
          if( selected !== undefined ){
            message = "";
            advance(selected, r);
          }
        }
      }
    })
  }

  function doClose(): void {
    destroy();
  }
</script>

<Floating title="顔認証完了" {destroy} {style}>
  <div class="content">
    <div class="patient-info">
      <span>名前</span>
      <span>{result.messageBody.name ?? ""}</span>
      <span>よみ</span>
      <span>{yomi}</span>
      <span>生年月日</span>
      <span>{formatDate(result.messageBody.resultList[0].birthdate)}</span>
    </div>
    <div class="result-list">
      {#each result.messageBody.resultList as r}
        <div class="result-list-item">
          <span>保険者</span>
          <span>{r.insurerName}</span>
          <span>保険者番号</span>
          <span>{r.insurerNumber}</span>
          {#if r.insuredCardSymbol}
            <span>被保険者記号</span>
            <span>{r.insuredCardSymbol}</span>
          {/if}
          <span>被保険者番号</span>
          <span>{r.insuredIdentificationNumber}</span>
          {#if r.insuredBranchNumber}
            <span>枝番</span>
            <span>{r.insuredBranchNumber}</span>
          {/if}
        </div>
      {/each}
    </div>
    {#if message}
      <div class="message">{message}</div>
    {/if}
    <div class="commands">
      {#if resolvedState instanceof AllResolved}
        {@const resolved = resolvedState}
        <button
          on:click={async () => {
            await doRegister(resolved);
            doClose();
          }}>診察登録</button
        >
      {:else if resolvedState instanceof MultiplePatients}
        {@const resolved = resolvedState}
        <button
          on:click={() => doChoosePatient(resolved.patients, resolved.result)}
          >患者選択</button
        >
      {:else}
        <button on:click={doClose}>閉じる</button>
      {/if}
    </div>
  </div>
</Floating>

<style>
  .content {
    background-color: white;
    opacity: 1;
    max-height: 300px;
    height: auto;
    overflow-y: auto;
  }

  .patient-info {
    display: grid;
    grid-template-columns: auto 1fr;
    margin: 10px 0;
  }

  .patient-info > *:nth-child(odd) {
    margin-right: 10px;
  }

  .result-list-item {
    display: grid;
    grid-template-columns: auto 1fr;
    margin: 10px 0;
    border: 1px solid gray;
    padding: 10px;
    margin-bottom: 10px;
  }

  .result-list-item > *:nth-child(odd) {
    margin-right: 10px;
  }

  .message {
    padding: 10px;
    margin: 10px 0;
  }

  .commands {
    margin-top: 10px;
    display: flex;
    justify-content: right;
    align-items: center;
  }
</style>
