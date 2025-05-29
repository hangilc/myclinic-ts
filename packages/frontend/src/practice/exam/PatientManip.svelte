<script lang="ts">
  import api from "@/lib/api";
  import { confirm } from "@/lib/confirm-call";
  import { PatientWrapper, Visit, WqueueState } from "myclinic-model";
  import { writable, type Writable } from "svelte/store";
  import { endPatient, currentPatient, currentVisitId } from "./exam-vars";
  import CashierDialog from "./patient-manip/CashierDialog.svelte";
  import GazouListDialog from "./patient-manip/GazouListDialog.svelte";
  import SearchTextDialog from "./patient-manip/search-text/SearchTextDialog.svelte";
  import PrescHistoryDialog from "./patient-manip/PrescHistoryDialog.svelte";
  import UploadImageDialog from "./patient-manip/UploadImageDialog.svelte";
  import PatientMemoEditorDialog from "./patient-manip/PatientMemoEditorDialog.svelte";
  import { MeisaiWrapper, calcRezeptMeisai } from "@/lib/rezept-meisai";
  import { cache } from "@lib/cache";
  import { DateWrapper } from "myclinic-util";
  import { searchPresc } from "@/lib/denshi-shohou/presc-api";
  import { formatHokenshaBangou } from "myclinic-rezept/helper";
  import {
    checkShohouResult,
    type SearchResult,
  } from "@/lib/denshi-shohou/shohou-interface";
  import PrescListDialog from "./PrescListDialog.svelte";
  import CashierHokengaiDialog from "./CashierHokengaiDialog.svelte";
  import type { PatientMemo } from "myclinic-model/model";
  import { PatientMemoWrapper } from "@/lib/patient-memo";
  import MailDialog from "@/lib/MailDialog.svelte";

  let cashierVisitId: Writable<number | null> = writable(null);

  async function doCashier() {
    const patient = $currentPatient;
    const visitId = $currentVisitId;
    if (visitId && visitId > 0 && patient) {
      cashierVisitId.set(visitId);
      const rezeptMeisai = await calcRezeptMeisai(visitId);
      let visit = await api.getVisit(visitId);
      if (
        visit.shahokokuhoId === 0 &&
        visit.koukikoureiId === 0 &&
        !hasHokengai(visit)
      ) {
        await fixHokengai(visit);
      }
      const d: CashierDialog = new CashierDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          visitId: cashierVisitId,
          meisai: new MeisaiWrapper(rezeptMeisai),
        },
      });
    }
  }

  function fixHokengai(visit: Visit): Promise<void> {
    return new Promise((resolve, _reject) => {
      const d: CashierHokengaiDialog = new CashierHokengaiDialog({
        target: document.body,
        props: {
          destroy: async (s: string | undefined) => {
            if (s) {
              visit = Object.assign({}, visit);
              let attr = JSON.parse(visit.attributesStore ?? "{}");
              attr.hokengai = [s];
              await api.updateVisit(
                Object.assign({}, visit, {
                  attributesStore: JSON.stringify(attr),
                }),
              );
            }
            d.$destroy();
            resolve();
          },
        },
      });
    });
  }

  function hasHokengai(visit: Visit): boolean {
    const attr = JSON.parse(visit.attributesStore ?? "{}");
    return attr.hokengai && attr.hokengai[0] && attr.hokengai[0] !== "";
  }

  function onEndPatientClick() {
    endPatient(WqueueState.WaitReExam);
  }

  function doRegister(): void {
    const patient = $currentPatient;
    if (patient != null) {
      confirm("診察を登録しますか？", () => {
        api.startVisit(patient.patientId, new Date());
      });
    }
  }

  function doSearchText() {
    if ($currentPatient) {
      const d: SearchTextDialog = new SearchTextDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          patient: $currentPatient,
        },
      });
    }
  }

  function doUploadImage() {
    if ($currentPatient) {
      const d: UploadImageDialog = new UploadImageDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
        },
      });
    }
  }

  function doGazouList() {
    if ($currentPatient) {
      const d: GazouListDialog = new GazouListDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          patientId: $currentPatient.patientId,
        },
      });
    }
  }

  function doMemo() {
    if ($currentPatient) {
      const patient = $currentPatient;
      const d: PatientMemoEditorDialog = new PatientMemoEditorDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          memo: patient.memo,
          onEnter: async (newMemo: PatientMemo) => {
            const patientWrapper = new PatientWrapper(patient);
            patientWrapper.setMemo(newMemo);
            await api.updatePatient(patientWrapper.patient);
          },
        },
      });
    }
  }

  async function searchPatientPresc(
    patientId: number,
    at: DateWrapper,
  ): Promise<SearchResult | undefined> {
    let kikancode = await cache.getShohouKikancode();
    let shahokokuho = await api.findAvailableShahokokuho(
      patientId,
      at.asSqlDate(),
    );
    if (shahokokuho) {
      return await searchPresc(
        kikancode,
        formatHokenshaBangou(shahokokuho.hokenshaBangou),
        shahokokuho.hihokenshaKigou,
        shahokokuho.hihokenshaBangou,
        shahokokuho.edaban,
        undefined,
        undefined,
      );
    } else {
      let koukikourei = await api.findAvailableKoukikourei(
        patientId,
        at.asSqlDate(),
      );
      if (koukikourei) {
        return await searchPresc(
          kikancode,
          koukikourei.hokenshaBangou,
          undefined,
          koukikourei.hihokenshaBangou,
          undefined,
          undefined,
          undefined,
        );
      }
    }
    return undefined;
  }

  async function doPrescList() {
    let patient = $currentPatient;
    if (patient) {
      let result = await searchPatientPresc(
        patient.patientId,
        DateWrapper.from(new Date()),
      );
      if (result) {
        let err = checkShohouResult(result);
        if (err) {
          alert(err);
          return;
        }
        let list = result.XmlMsg.MessageBody.PrescriptionIdList;
        if (list) {
          list.sort(
            (a, b) => -a.CreateDateTime.localeCompare(b.CreateDateTime),
          );
          const d: PrescListDialog = new PrescListDialog({
            target: document.body,
            props: {
              destroy: () => d.$destroy(),
              list,
            },
          });
        }
      } else {
        alert("Empty result");
      }
    }
  }

  function doPrescHistory() {
    if ($currentPatient) {
      const d: PrescHistoryDialog = new PrescHistoryDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          patient: $currentPatient,
        },
      });
    }
  }

  async function doEmail() {
    const patient = $currentPatient;
    if (patient) {
      let to = new PatientMemoWrapper(patient.memo).getEmail();
      let from = await cache.getDoctorEmail();
      if (!to) {
        alert("患者のメールアドレスが登録されていません。");
        return;
      }
      if (!from) {
        alert("医師のメールアドレスが登録されていません。");
        return;
      }
      const d: MailDialog = new MailDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          to,
          from,
          subject: "",
          content: "",
        },
      });
    }
  }
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<div class="patient-manip top">
  <button on:click={doCashier} disabled={$currentVisitId == null}>会計</button>
  <button on:click={onEndPatientClick}>患者終了</button>
  <a href="javascript:void(0)" on:click={doRegister}>診察登録</a>
  <a href="javascript:void(0)" on:click={doSearchText}>文章検索</a>
  <a href="javascript:void(0)" on:click={doPrescHistory}>処方履歴</a>
  <a href="javascript:void(0)" on:click={doMemo}>メモ編集</a>
  <a href="javascript:void(0)" on:click={doEmail}>メール送信</a>
  <a href="javascript:void(0)" on:click={doUploadImage}>画像保存</a>
  <a href="javascript:void(0)" on:click={doGazouList}>画像一覧</a>
  <a href="javascript:void(0)" on:click={doPrescList}>処方一覧</a>
</div>

<style>
  .top {
    display: flex;
    align-items: center;
  }
  * + button {
    margin-left: 4px;
  }
  * + a {
    margin-left: 4px;
  }
</style>
