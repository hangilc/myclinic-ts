<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import type { Patient, Visit } from "myclinic-model";
  import * as kanjidate from "kanjidate";
  import api from "@/lib/api";
  import type { PatientData } from "../cashier/choose-patient-dialog";

  export let destroy: () => void;
  export let patients: Patient[];
  export let onSelect: (selected: Patient | undefined) => void;
  let dataList: PatientData[] = [];

  init();

  async function init() {
    const promises: Promise<PatientData>[] = patients.map(async (patient) => {
      const count = await api.countVisitByPatient(patient.patientId);
      const visitIds: number[] = await api.listVisitIdByPatientReverse(
        patient.patientId,
        0,
        1
      );
      let visit: Visit | undefined = undefined;
      if (visitIds.length > 0) {
        visit = await api.getVisit(visitIds[0]);
      }
      return {
        patient: patient,
        visitCount: count,
        lastVisit: visit,
      };
    });
    dataList = await Promise.all(promises);
  }

  function doSelect(patient: Patient): void {
    destroy();
    onSelect(patient);
  }

  function doClose(): void {
    destroy();
    onSelect(undefined);
  }
</script>

<Dialog title="資格確認患者選択" destroy={doClose} styleWidth="300px">
  <div class="message">
    複数の該当患者があります。患者番号を一つ選択してください。
  </div>
  {#if patients.length > 0}
    {@const patient = patients[0]}
    <div class="info">
      <span>名前</span>
      <span>{patient.fullName(" ")}</span>
      <span>よみ</span>
      <span>{patient.fullYomi(" ")}</span>
      <span>生年月日</span>
      <span>{kanjidate.format(kanjidate.f2, patient.birthday)}</span>
    </div>
    {#each dataList as data (data.patient.patientId)}
      <div class="data-list">
        <div class="data">
          <div class="disp">
            <span>患者番号</span>
            <span>{data.patient.patientId}</span>
            <span>受診回数</span>
            <span>{data.visitCount}</span>
            {#if data.lastVisit !== undefined}
              <span>直近の受診</span>
              <span
                >{kanjidate.format(
                  kanjidate.f2,
                  data.lastVisit.visitedAt.substring(0, 10)
                )}</span
              >
            {/if}
          </div>
          <div class="commands">
            <button on:click={() => doSelect(data.patient)}>選択</button>
          </div>
        </div>
      </div>
    {/each}
    <div class="bottom-commands">
      <button on:click={doClose}>キャンセル</button>
    </div>
  {/if}
</Dialog>

<style>
  .message {
    margin: 10px 0;
  }

  .data-list {
    max-height: 400px;
    overflow-y: auto;
  }

  .data {
    border: 1px solid gray;
    margin: 10px 0;
    padding: 10px;
  }

  .info, .disp {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .info > *:nth-child(odd), .disp > *:nth-child(odd) {
    margin-right: 10px;
  }

  .bottom-commands {
    display: flex;
    justify-content: right;
  }
</style>
