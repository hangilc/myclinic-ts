<script lang="ts">
  import api from "@/lib/api";
  import { confirm } from "@/lib/confirm-call";
  import { WqueueState } from "myclinic-model";
  import { writable, type Writable } from "svelte/store";
  import { endPatient, currentPatient, currentVisitId } from "./exam-vars";
  import CashierDialog from "./patient-manip/CashierDialog.svelte";
  import GazouListDialog from "./patient-manip/GazouListDialog.svelte";
  import SearchTextDialog from "./patient-manip/SearchTextDialog.svelte";
  import UploadImageDialog from "./patient-manip/UploadImageDialog.svelte";
  import * as kanjidate from "kanjidate";
  import PatientMemoEditorDialog from "./patient-manip/PatientMemoEditorDialog.svelte";
  import { MeisaiWrapper, calcRezeptMeisai } from "@/lib/rezept-meisai";
  import * as cache from "@lib/cache";
  import { DateWrapper } from "myclinic-util";
  import { searchPresc } from "@/lib/denshi-shohou/presc-api";
  import { formatHokenshaBangou } from "myclinic-rezept/helper";

  let cashierVisitId: Writable<number | null> = writable(null);

  async function doCashier() {
    const patient = $currentPatient;
    const visitId = $currentVisitId;
    if (visitId && visitId > 0 && patient) {
      cashierVisitId.set(visitId);
      const rezeptMeisai = await calcRezeptMeisai(visitId);
      const visit = await api.getVisit(visitId);
      const kd = kanjidate.KanjiDate.fromString(visit.visitedAt);
      const year = kd.year;
      const month = kd.month;
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
          onEnter: (newMemo: string | undefined) => {
            const newPatient = Object.assign({}, patient, { memo: newMemo });
            api.updatePatient(newPatient);
          },
        },
      });
    }
  }

  async function doPrescList() {
    let patient = $currentPatient;
    if (patient) {
      const kikancode = await cache.getShohouKikancode();
      const patientId = patient.patientId;
      let shahokokuho = await api.findAvailableShahokokuho(
        patientId,
        new Date()
      );
      if (shahokokuho) {
        let result = await searchPresc(
          kikancode,
          formatHokenshaBangou(shahokokuho.hokenshaBangou),
          shahokokuho.hihokenshaKigou,
          shahokokuho.hihokenshaBangou,
          shahokokuho.edaban,
          undefined,
          undefined
        );
        console.log("result", result);
      } else {
        let koukikourei = await api.findAvailableKoukikourei(
          patientId,
          new Date()
        );
        if (koukikourei) {
          let result = await searchPresc(
            kikancode,
            koukikourei.hokenshaBangou,
            undefined,
            koukikourei.hihokenshaBangou,
            undefined,
            undefined,
            undefined
          );
          console.log("result", result);
        }
      }
    }
  }
</script>

<div class="patient-manip top">
  <button on:click={doCashier} disabled={$currentVisitId == null}>会計</button>
  <button on:click={onEndPatientClick}>患者終了</button>
  <a href="javascript:void(0)" on:click={doRegister}>診察登録</a>
  <a href="javascript:void(0)" on:click={doSearchText}>文章検索</a>
  <a href="javascript:void(0)" on:click={doMemo}>メモ編集</a>
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
