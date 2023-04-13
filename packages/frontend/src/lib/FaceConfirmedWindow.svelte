<script lang="ts">
  import type { OnshiResult } from "onshi-result";
  import {
    AllResolved,
    Initializing,
    MultiplePatients,
    MultipleResultItems,
    NewHoken,
    NoPatient,
    NoResultItem,
    OnshiPatient,
    invalidateKoukikourei,
    invalidateShahokokuho,
    searchPatient,
    yesterdayAsSqlDate,
  } from "./face-confirm-window";
  import Floating from "./Floating.svelte";
  import type { ResultItem } from "onshi-result/ResultItem";
  import { hokenshaBangouRep } from "./hoken-rep";
  import RegisterOnshiPatientDialog from "./RegisterOnshiPatientDialog.svelte";
  import {
    dateToSqlDate,
    Kouhi,
    Shahokokuho,
    type Patient,
    Koukikourei,
  } from "myclinic-model";
  import api from "./api";
  import {
    create_hoken_from_onshi_kakunin,
    koukikoureiOnshiConsistent,
    shahokokuhoOnshiConsistent,
  } from "./hoken-onshi-consistent";
  import ChoosePatientDialog from "./ChoosePatientDialog.svelte";
  import RegisterOnshiShahokokuhoDialog from "./RegisterOnshiShahokokuhoDialog.svelte";

  export let destroy: () => void;
  export let result: OnshiResult;
  export let onRegister: () => void = () => {};

  let resultItem: ResultItem | undefined =
    result.resultList.length === 1 ? result.resultList[0] : undefined;
  let resolvedState:
    | NoResultItem
    | MultipleResultItems
    | Initializing
    | NoPatient
    | MultiplePatients
    | AllResolved
    | NewHoken
    | undefined = undefined;
  const style =
    "width:360px;padding:6px;border:1px solid blue;opacity:1;background-color:white;left:100px;top:100px;";

  init();

  async function init() {
    if (resultItem) {
      resolvedState = new Initializing();
      const patients = await searchPatient(
        resultItem.name,
        resultItem.nameKana,
        resultItem.birthdate
      );
      if (patients.length === 0) {
        resolvedState = new NoPatient(resultItem);
      } else if (patients.length === 1) {
        advanceWithPatient(patients[0], resultItem);
      } else {
        resolvedState = new MultiplePatients(patients, resultItem);
      }
    } else {
      if (result.resultList.length === 0) {
        resolvedState = new NoResultItem();
      } else if (result.resultList.length > 1) {
        resolvedState = new MultipleResultItems();
      }
    }
  }

  async function advanceWithPatient(patient: Patient, r: ResultItem) {
    const at = dateToSqlDate(new Date());
    const shahoOpt =
      (await api.findAvailableShahokokuho(patient.patientId, at)) ?? undefined;
    const koukiOpt =
      (await api.findAvailableKoukikourei(patient.patientId, at)) ?? undefined;
    const kouhiList: Kouhi[] = await api.listAvailableKouhi(
      patient.patientId,
      at
    );
    if (shahoOpt && !koukiOpt) {
      const err = shahokokuhoOnshiConsistent(shahoOpt, r);
      if (err) {
        const validUpto = yesterdayAsSqlDate();
        await invalidateShahokokuho(shahoOpt, validUpto);
      }
      resolvedState = new AllResolved(patient, shahoOpt, kouhiList);
    } else if (koukiOpt && !shahoOpt) {
      const err = koukikoureiOnshiConsistent(koukiOpt, r);
      if (err) {
        const validUpto = yesterdayAsSqlDate();
        await invalidateKoukikourei(koukiOpt, validUpto);
      }
      resolvedState = new AllResolved(patient, koukiOpt, kouhiList);
    } else {
      resolvedState = new NewHoken(patient, r, shahoOpt, koukiOpt, kouhiList);
    }
  }

  async function advanceWithHoken(
    patient: Patient,
    hoken: Shahokokuho | Koukikourei,
    shahoOpt: Shahokokuho | undefined,
    koukiOpt: Koukikourei | undefined,
    kouhiList: Kouhi[],
    r: ResultItem
  ) {
    if( !shahoOpt && !koukiOpt ){
      resolvedState = new AllResolved(patient, hoken, kouhiList);
    } else {
      throw new Error("Not implemented yet");
    }
  }

  function doRegisterPatient(r: ResultItem) {
    const onshiPatient = new OnshiPatient(r);
    const patientTmpl = onshiPatient.toPatient();
    const d: RegisterOnshiPatientDialog = new RegisterOnshiPatientDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        patient: patientTmpl,
        onEnter: (entered) => {
          advanceWithPatient(entered, r);
        },
      },
    });
  }

  function doClose() {
    destroy();
  }

  function currentRep(
    shahoOpt: Shahokokuho | undefined,
    koukiOpt: Koukikourei | undefined
  ): string {
    return [
      shahoOpt ? hokenshaBangouRep(shahoOpt.hokenshaBangou) : "",
      koukiOpt ? hokenshaBangouRep(koukiOpt.hokenshaBangou) : "",
    ]
      .filter((s) => s !== "")
      .join("、");
  }

  async function doMultiplePatients(resolved: MultiplePatients) {
    const d: ChoosePatientDialog = new ChoosePatientDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        patients: resolved.patients,
        onSelect: (selected: Patient | undefined) => {
          if (selected !== undefined) {
            advanceWithPatient(selected, resolved.result);
          }
        },
      },
    });
  }

  async function doRegisterNewHoken(newHoken: NewHoken) {
    const patient: Patient = newHoken.patient;
    const result: ResultItem = newHoken.resultItem;
    const today = new Date();
    const hoken = create_hoken_from_onshi_kakunin(patient.patientId, result);
    if (typeof hoken === "string") {
      alert(hoken);
    } else if (hoken instanceof Shahokokuho) {
      const d: RegisterOnshiShahokokuhoDialog =
        new RegisterOnshiShahokokuhoDialog({
          target: document.body,
          props: {
            destroy: () => d.$destroy(),
            shahokokuho: hoken,
            onEnter: (entered: Shahokokuho) => {
              advanceWithHoken(
                newHoken.patient,
                entered,
                newHoken.shahokokuhoOpt,
                newHoken.koukikoureiOpt,
                newHoken.kouhiList,
                newHoken.resultItem
              );
            },
          },
        });
    } else {
      // const rep = koukikoureiRep(hoken.futanWari);
      // alertMessage += `${rep}を登録します。`;
      // confirm(alertMessage, async () => {
      //   await api.newKoukikourei(hoken);
      //   resolvePatient();
      // });
    }
  }

  async function doRegisterVisit(resolved: AllResolved) {}

  function hokenRep(hoken: Shahokokuho | Koukikourei): string {
    let hokenshaBangou: string | number;
    if( hoken instanceof Shahokokuho ){
      hokenshaBangou = hoken.hokenshaBangou;
    } else {
      hokenshaBangou = hoken.hokenshaBangou;
    }
    return hokenshaBangouRep(hokenshaBangou);
  }
</script>

<Floating title="顔認証完了" {destroy} {style}>
  <div class="onshi-content">
    <div class="onshi-content-title">資格確認内容</div>
    {#if resultItem}
      {@const onshiPatient = new OnshiPatient(resultItem)}
      <div>
        {onshiPatient.fullName()}
        ({onshiPatient.fullYomi()})
        {onshiPatient.birthdayRep()}生
      </div>
      {#if resultItem.insurerNumber}
        <div>{hokenshaBangouRep(resultItem.insurerNumber)}</div>
      {/if}
    {/if}
  </div>
  <div data-cy="message" class="message">
    {#if resolvedState instanceof NoResultItem}
      資格確認結果なし
    {:else if resolvedState instanceof MultipleResultItems}
      複数の資格確認結果
    {:else if resolvedState instanceof Initializing}
      初期化中
    {:else if resolvedState instanceof NoPatient}
      該当患者なし
    {:else if resolvedState instanceof MultiplePatients}
      複数の該当患者
    {:else if resolvedState instanceof NewHoken}
      {@const resolved = resolvedState}
      <div>
        <span data-cy="resolved-patient-id">({resolved.patient.patientId})</span
        >
        {resolved.patient.fullName()}
      </div>
      <div>新規保険</div>
      {#if resolved.shahokokuhoOpt || resolved.koukikoureiOpt}
        <div>
          （現在有効な{currentRep(
            resolved.shahokokuhoOpt,
            resolved.koukikoureiOpt
          )}は有効期限を設定して無効化されます。）
        </div>
      {/if}
    {:else if resolvedState instanceof AllResolved}
    {@const resolved = resolvedState}
        <div>
          <span data-cy="resolved-patient-id">({resolved.patient.patientId})</span
            >
            {resolved.patient.fullName()}
        </div>
        <div>
          {hokenRep(resolved.hoken)}
        </div>
    {/if}
  </div>
  <div class="commands">
    {#if resolvedState instanceof NoResultItem || resolvedState instanceof MultipleResultItems || resolvedState instanceof Initializing}
      <button on:click={doClose}>閉じる</button>
    {:else if resolvedState instanceof NoPatient}
      {@const resolved = resolvedState}
      <button on:click={() => doRegisterPatient(resolved.result)}
        >新規患者登録</button
      >
    {:else if resolvedState instanceof MultiplePatients}
      {@const resolved = resolvedState}
      <button on:click={() => doMultiplePatients(resolved)}>患者選択</button>
    {:else if resolvedState instanceof NewHoken}
      {@const resolved = resolvedState}
      <button on:click={() => doRegisterNewHoken(resolved)}
        >新規保険証登録</button
      >
    {:else if resolvedState instanceof AllResolved}
      {@const resolved = resolvedState}
      <button on:click={() => doRegisterVisit(resolved)}>診察登録</button>
    {/if}
  </div>
</Floating>

<!-- <script lang="ts">
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
    Patient,
    Shahokokuho,
    type Kouhi,
  } from "myclinic-model";
  import {
    AllResolved,
    InconsistentHoken,
    MultiplePatients,
    NewHoken,
    NoPatient,
  } from "./face-confirm-window";
  import {
    create_hoken_from_onshi_kakunin,
    koukikoureiOnshiConsistent,
    shahokokuhoOnshiConsistent,
  } from "./hoken-onshi-consistent";
  import ChoosePatientDialog from "./ChoosePatientDialog.svelte";
  import { koukikoureiRep, shahokokuhoName, shahokokuhoRep } from "./hoken-rep";
  import { confirm } from "./confirm-call";
  import type { ResultItem } from "onshi-result/ResultItem";

  export let destroy: () => void;
  export let result: OnshiResult;
  export let onRegister: () => void = () => {};

  const style =
    "width:360px;padding:6px;border:1px solid blue;opacity:1;background-color:white;left:100px;top:100px;";
  let yomi: string = result.messageBody.nameKana
    ? toZenkaku(result.messageBody.nameKana)
    : "";
  let resolvedState:
    | undefined
    | AllResolved
    | MultiplePatients
    | InconsistentHoken
    | NewHoken
    | NoPatient = undefined;
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

  async function advance(patient: Patient, r: ResultItem) {
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
        resolvedState = new InconsistentHoken(patient, shahoOpt, koukiOpt, r);
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
        message = err;
        resolvedState = new InconsistentHoken(patient, shahoOpt, koukiOpt, r);
      }
    } else if (!shahoOpt && !koukiOpt) {
      message = "新しい保険証";
      resolvedState = new NewHoken(patient, r);
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
      if (patients.length === 1) {
        message = "";
        advance(patients[0], r);
      } else if (patients.length === 0) {
        message = "該当する登録患者情報がありません。";
        resolvedState = new NoPatient(r);
      } else {
        message = "該当する登録患者情報が複数あります。";
        resolvedState = new MultiplePatients(patients, r);
      }
    } else if (result.resultList.length === 0) {
      message = "確認された保険情報がありません。";
      resolvedState = undefined;
    } else {
      message = "確認された保険情報が複数あります。";
      resolvedState = undefined;
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
      new Onshi(visit.visitId, JSON.stringify(resolved.onshiResult.toJSON()))
    );
    onRegister();
  }

  function doChoosePatient(patients: Patient[], r: ResultItem) {
    const d: ChoosePatientDialog = new ChoosePatientDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        patients,
        onSelect: (selected: Patient | undefined) => {
          if (selected !== undefined) {
            message = "";
            advance(selected, r);
          }
        },
      },
    });
  }

  async function registerOnshiResultAsHoken(
    patient: Patient,
    result: ResultItem,
    preAlertMessage: string = ""
  ) {
    const today = new Date();
    let alertMessage: string = preAlertMessage;
    const hoken = create_hoken_from_onshi_kakunin(
      patient.patientId,
      result,
      today
    );
    if (typeof hoken === "string") {
      alert(hoken);
    } else if (hoken instanceof Shahokokuho) {
      const rep = shahokokuhoName(hoken.hokenshaBangou);
      alertMessage += `${rep}を登録します。`;
      console.log(hoken);
      confirm(alertMessage, async () => {
        await api.newShahokokuho(hoken);
        resolvePatient();
      });
    } else {
      const rep = koukikoureiRep(hoken.futanWari);
      alertMessage += `${rep}を登録します。`;
      confirm(alertMessage, async () => {
        await api.newKoukikourei(hoken);
        resolvePatient();
      });
    }
  }

  function doHokenUpdate(resolved: InconsistentHoken) {
    message = "";
    // const today: Date = new Date();
    let alertMessage: string = "";
    if (resolved.shahokokuhoOpt !== undefined) {
      const rep = shahokokuhoRep(resolved.shahokokuhoOpt);
      alertMessage += `現在有効な「${rep}」の有効期限を終了します。`;
    }
    if (resolved.koukikoureiOpt !== undefined) {
      const rep = koukikoureiRep(resolved.koukikoureiOpt.futanWari);
      alertMessage += `現在有効な「${rep}」の有効期限を終了します。`;
    }
    registerOnshiResultAsHoken(resolved.patient, resolved.result, alertMessage);
  }

  function doNewHoken(resolved: NewHoken) {
    registerOnshiResultAsHoken(resolved.patient, resolved.result);
  }

  function composePatientFromResult(
    r: ResultItem
  ): Patient | string | undefined {
    const name: string = r.name;
    const [lastName, firstName] = name.split("　");
    if (!(lastName && firstName)) {
      return "氏名がありません。";
    }
    const yomi: string | undefined = r.nameKana;
    if (!yomi) {
      return "氏名のよみがありません。";
    }
    const [lastNameYomi, firstNameYomi] = yomi.split(" ");
    if (!(lastNameYomi && firstNameYomi)) {
      return "氏名のよみがありません。";
    }
    if (r.sex1 == undefined) {
      return "性別がわかりません。";
    }
    const sex: string = r.sex1 === "男" ? "M" : "F";
    const birthday = r.birthdate;
    const addr = r.address ?? "";
    const phone = prompt("患者の電話番号");
    if (phone === null) {
      return undefined;
    }
    return new Patient(
      0,
      lastName,
      firstName,
      lastNameYomi,
      firstNameYomi,
      sex,
      birthday,
      addr,
      phone
    );
  }

  async function doRegisterPatient(resolved: NoPatient) {
    const patient: Patient | string | undefined = composePatientFromResult(
      resolved.result
    );
    if (patient === undefined) {
      // cancel selected
      // nop
    } else if (typeof patient === "string") {
      message = patient;
      resolvedState = undefined;
    } else {
      const patientEntered: Patient = await api.enterPatient(patient);
      advance(patientEntered, resolved.result);
      // const patientId = patientEntered.patientId;
      // const validDate: string | undefined =
      //   resolved.result.insuredCardValidDate;
      // const validFrom = validDate ? new Date(validDate) : new Date();
      // const hoken = create_hoken_from_onshi_kakunin(
      //   patientId,
      //   resolved.result,
      //   validFrom
      // );
      // if (typeof hoken === "string") {
      //   message = hoken;
      //   resolvedState = undefined;
      // } else {
      //   if (hoken instanceof Shahokokuho) {
      //     const shahokokuho = await api.enterShahokokuho(hoken);
      //     await api.startVisitWithHoken(
      //       patientId,
      //       new Date(),
      //       new HokenIdSet(shahokokuho.shahokokuhoId, 0, 0, 0, 0, 0)
      //     );
      //   } else {
      //     const koukikourei = await api.enterKoukikourei(hoken);
      //     await api.startVisitWithHoken(
      //       patientId,
      //       new Date(),
      //       new HokenIdSet(0, koukikourei.koukikoureiId, 0, 0, 0, 0)
      //     );
      //   }
      //   message = "新規患者登録と診察受付を行いました。";
      //   resolvedState = undefined;
      //   doClose();
      //   onRegister();
      // }
    }
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
      <div class="message" data-cy="message">{message}</div>
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
      {:else if resolvedState instanceof InconsistentHoken}
        {@const resolved = resolvedState}
        <button on:click={() => doHokenUpdate(resolved)}>保険証更新</button>
      {:else if resolvedState instanceof NewHoken}
        {@const resolved = resolvedState}
        <button on:click={() => doNewHoken(resolved)}>新規保険証登録</button>
      {:else if resolvedState instanceof NoPatient}
        {@const resolved = resolvedState}
        <button on:click={() => doRegisterPatient(resolved)}
          >新規患者登録</button
        >
      {:else}
        <button on:click={doClose}>閉じる</button>
      {/if}
    </div>
  </div>
</Floating> -->

<style>
  .onshi-content {
    margin: 1.5em 0 10px 0;
    border: 1px solid gray;
    position: relative;
    padding: 1.5em 10px 10px 10px;
  }

  .onshi-content-title {
    background-color: white;
    border: 1px solid gray;
    padding: 4px;
    position: absolute;
    top: -1em;
    left: 10px;
    display: inline-block;
  }

  .content {
    background-color: white;
    opacity: 1;
    max-height: 400px;
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
