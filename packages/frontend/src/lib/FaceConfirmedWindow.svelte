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
    fixKoukikoureiValidUpto,
    fixShahokokuhoValidUpto,
    searchPatient,
  } from "./face-confirm-window";
  import Floating from "./Floating.svelte";
  import type { ResultItem } from "onshi-result/ResultItem";
  import { hokenshaBangouRep, isKoukikourei, kouhiRep } from "./hoken-rep";
  import RegisterOnshiPatientDialog from "./RegisterOnshiPatientDialog.svelte";
  import {
    dateToSqlDate,
    Kouhi,
    Shahokokuho,
    type Patient,
    Koukikourei,
    HokenIdSet,
    Visit,
    Onshi,
  } from "myclinic-model";
  import api from "./api";
  import {
    create_hoken_from_onshi_kakunin,
    koukikoureiOnshiConsistent,
    shahokokuhoOnshiConsistent,
  } from "./onshi-hoken-consistency";
  import ChoosePatientDialog from "./ChoosePatientDialog.svelte";
  import RegisterOnshiShahokokuhoDialog from "./RegisterOnshiShahokokuhoDialog.svelte";
  import RegisterOnshiKoukikoureiDialog from "./RegisterOnshiKoukikoureiDialog.svelte";
  import { validFromOf } from "./util";
  import KouhiDialog from "@/cashier/patient-dialog/edit/KouhiDialog.svelte";
  import { convertHankakuKatakanaToZenkakuHiragana } from "./zenkaku";
  import type { EventEmitter } from "./event-emitter";
  import FaceConfirmedSearchPatientDialog from "./face-confirmed/FaceConfirmedSearchPatientDialog.svelte";
  import FaceConfirmedConfirmSelectPatient from "./face-confirmed/FaceConfirmedConfirmSelectPatient.svelte";
  import { checkOnshiPatientInconsistency } from "./onshi-inconsistency";

  export let destroy: () => void;
  export let result: OnshiResult;
  export let onRegister: (visit: Visit) => void = () => {};
  export let hotlineTrigger: EventEmitter<string> | undefined = undefined;

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
        resultItem.nameKana
          ? convertHankakuKatakanaToZenkakuHiragana(resultItem.nameKana)
          : undefined,
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
    if (shahoOpt) {
      const err = shahokokuhoOnshiConsistent(shahoOpt, r);
      if( err ){
        console.error("INCONSISTENT", err);
      }
      if (!err) {
        resolvedState = new AllResolved(patient, shahoOpt, kouhiList);
        return;
      }
    } else if (koukiOpt) {
      const err = koukikoureiOnshiConsistent(koukiOpt, r);
      if (!err) {
        resolvedState = new AllResolved(patient, koukiOpt, kouhiList);
        return;
      }
    }
    resolvedState = new NewHoken(patient, r, shahoOpt, koukiOpt, kouhiList);
    console.log("resolvedState", resolvedState);
  }

  async function advanceWithHoken(
    patient: Patient,
    hoken: Shahokokuho | Koukikourei,
    shahoOpt: Shahokokuho | undefined,
    koukiOpt: Koukikourei | undefined,
    kouhiList: Kouhi[]
  ) {
    const validFrom = validFromOf(hoken);
    let errMsg: string = "";
    if (shahoOpt) {
      const err = await fixShahokokuhoValidUpto(shahoOpt, validFrom);
      if (err) {
        errMsg += "現在有効な社保国保が、" + err;
      }
    }
    if (koukiOpt) {
      const err = await fixKoukikoureiValidUpto(koukiOpt, validFrom);
      if (err) {
        errMsg += "現在有効な後期高齢保険が、" + err;
      }
    }
    if (errMsg) {
      alert(errMsg);
    }
    resolvedState = new AllResolved(patient, hoken, kouhiList);
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
                newHoken.kouhiList
              );
            },
          },
        });
    } else {
      const d: RegisterOnshiKoukikoureiDialog =
        new RegisterOnshiKoukikoureiDialog({
          target: document.body,
          props: {
            destroy: () => d.$destroy(),
            koukikourei: hoken,
            onEnter: (entered: Koukikourei) => {
              advanceWithHoken(
                newHoken.patient,
                entered,
                newHoken.shahokokuhoOpt,
                newHoken.koukikoureiOpt,
                newHoken.kouhiList
              );
            },
          },
        });
    }
  }

  async function doEnterKouhi(resolved: AllResolved) {
    const d: KouhiDialog = new KouhiDialog({
      target: document.body,
      props: {
        patient: resolved.patient,
        title: "公費登録",
        destroy: () => d.$destroy(),
        init: null,
        onEntered: async (_entered: Kouhi) => {
          const kouhiList = await api.listAvailableKouhi(
            resolved.patient.patientId,
            new Date()
          );
          resolvedState = resolved.copy((c) => (c.kouhiList = kouhiList));
        },
      },
    });
  }

  async function doRegisterVisit(resolved: AllResolved) {
    const at = new Date();
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
    const hoken = new HokenIdSet(
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
      hoken
    );
    hotlineTrigger?.emit(
      `[Bot] ${resolved.patient.fullName(
        ""
      )}様の診察をマイナンバーカードで受け付けました。`
    );
    const onshi = new Onshi(visit.visitId, JSON.stringify(result.toJSON()));
    await api.setOnshi(onshi);
    doClose();
    onRegister(visit);
  }

  function hokenRep(hoken: Shahokokuho | Koukikourei): string {
    let hokenshaBangou: string | number;
    if (hoken instanceof Shahokokuho) {
      hokenshaBangou = hoken.hokenshaBangou;
    } else {
      hokenshaBangou = hoken.hokenshaBangou;
    }
    return hokenshaBangouRep(hokenshaBangou);
  }

  async function setOnshiName(
    patientId: number,
    name: string
  ): Promise<Patient> {
    const patient: Patient = await api.getPatient(patientId);
    const memo = patient.memoAsJson;
    memo["onshi-name"] = name;
    patient.memo = JSON.stringify(memo);
    await api.updatePatient(patient);
    return patient;
  }

  function doSearchForPatient(r: ResultItem) {
    const d: FaceConfirmedSearchPatientDialog =
      new FaceConfirmedSearchPatientDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          onshiName: r.name,
          onSelect: (patient: Patient) => {
            const errs = checkOnshiPatientInconsistency(r, patient);
            if (errs.length === 0) {
              advanceWithPatient(patient, r);
            } else if (errs.length === 1 && errs[0].kind === "patient-name") {
              const onshiPatient = new OnshiPatient(r);
              const dd: FaceConfirmedConfirmSelectPatient =
                new FaceConfirmedConfirmSelectPatient({
                  target: document.body,
                  props: {
                    destroy: () => dd.$destroy(),
                    patient,
                    onshiPatient,
                    onConfirmed: async () => {
                      let updated = await setOnshiName(
                        patient.patientId,
                        onshiPatient.name
                      );
                      await advanceWithPatient(updated, r);
                    },
                    onCancel: () => {
                      // nop
                    },
                  },
                });
            } else {
              alert(errs.map((e) => e.toString()).join("\n"));
            }
          },
        },
      });
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
      {#if resolved.shahokokuhoOpt || resolved.koukikoureiOpt}
        <div>
          {resolved.shahokokuhoOpt ? "社保国保" : "後期高齢"}
          （現在有効な{currentRep(
            resolved.shahokokuhoOpt,
            resolved.koukikoureiOpt
          )}は、可能であれば有効期限終了を設定します。）
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
        {#if resolved.hoken instanceof Shahokokuho && resolved.hoken.koureiStore > 0}
          ・高齢{resolved.hoken.koureiStore}割
        {/if}
      </div>
      {#each resolved.kouhiList as kouhi (kouhi.kouhiId)}
        <div data-kouhi-id={kouhi.kouhiId}>
          {kouhiRep(kouhi.futansha, kouhi.memoAsJson)}
        </div>
      {/each}
    {/if}
  </div>
  <div class="commands">
    {#if resolvedState instanceof NoResultItem || resolvedState instanceof MultipleResultItems || resolvedState instanceof Initializing}
      <button on:click={doClose}>閉じる</button>
    {:else if resolvedState instanceof NoPatient}
      {@const resolved = resolvedState}
      <button on:click={() => doSearchForPatient(resolved.result)}
        >既存患者検索</button
      >
      <button on:click={() => doRegisterPatient(resolved.result)}
        >新規患者登録</button
      >
    {:else if resolvedState instanceof MultiplePatients}
      {@const resolved = resolvedState}
      <button on:click={() => doMultiplePatients(resolved)}>患者選択</button>
    {:else if resolvedState instanceof NewHoken}
      {@const resolved = resolvedState}
      <button on:click={() => doRegisterNewHoken(resolved)}
        >{isKoukikourei(parseInt(resolved.resultItem.insurerNumber ?? "0"))
          ? "新規後期高齢登録"
          : "新規社保国保登録"}</button
      >
    {:else if resolvedState instanceof AllResolved}
      {@const resolved = resolvedState}
      <a href="javascript:;" on:click={() => doEnterKouhi(resolved)}>公費入力</a
      >
      <button on:click={() => doRegisterVisit(resolved)}>診察登録</button>
    {/if}
  </div>
</Floating>

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

  .commands a {
    text-decoration: none;
    margin-right: 4px;
    font-size: 0.8rem;
  }

  .commands button + button {
    margin-left: 4px;
  }
</style>
