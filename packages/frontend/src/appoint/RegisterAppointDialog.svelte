<script lang="ts">
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import type { AppointTimeData } from "./appoint-time-data";
  import * as kanjidate from "kanjidate";
  import { genid } from "@/lib/genid";
  import api from "@/lib/api";
  import {
    Appoint,
    AppointTime as AppointTimeModel,
    type Patient,
  } from "myclinic-model";
  import SelectItem2 from "@/lib/SelectItem2.svelte";
  import { validateAppoint } from "@/lib/validators/appoint-validator";
  import { intSrc, Invalid, strSrc } from "@/lib/validator";
  import { setFocus } from "@/lib/set-focus";

  export let destroy: () => void;
  export let title: string;
  export let appointTimeData: AppointTimeData;

  const kenshinId = genid();
  const withRegularId = genid();
  let searchText: string = "";
  let patientSearchResult: Patient[] = [];
  let patient: Patient | undefined = undefined;
  let memoInput: string = "";
  let errors: Invalid[] = [];
  let kenshinChecked: boolean = false;

  function appointTimeText(data: AppointTimeData): string {
    const d = kanjidate.format("{M}月{D}日（{W}）", data.appointTime.date);
    const fp = parseTime(data.appointTime.fromTime);
    const f = `${fp.hour}時${fp.minute}分`;
    const up = parseTime(data.appointTime.untilTime);
    const u = `${up.hour}時${up.minute}分`;
    return `${d}${f} - ${u}`;
  }

  function parseTime(time: string): { hour: number; minute: number } {
    const parts = time.split(":");
    return {
      hour: parseInt(parts[0]),
      minute: parseInt(parts[1]),
    };
  }

  async function doPatientSearch() {
    const t = searchText.trim();
    if (t !== "") {
      const result = await api.searchPatientSmart(t);
      if (result.length === 0) {
        alert("該当患者がありません。");
      } else if (result.length === 1) {
        doPatientSelect(result[0]);
      } else {
        patientSearchResult = result;
      }
    }
  }

  function doPatientSelect(p: Patient): void {
    patient = p;
    searchText = p.fullName();
    patientSearchResult = [];
  }

  async function doEnter() {
    let memoValue = kenshinChecked ? "{{健診}}" : "";
    const validation = validateAppoint(0, {
      appointTimeId: intSrc(appointTimeData.appointTime.appointTimeId),
      patientName: strSrc(searchText),
      patientId: intSrc(patient?.patientId ?? 0),
      memo: strSrc(memoValue + memoInput),
    });
    if (validation instanceof Appoint) {
      await api.registerAppoint(validation);
      destroy();
    } else {
      errors = validation;
    }
  }

  function doClose(): void {
    destroy();
  }
</script>

<SurfaceModal {destroy} {title}>
  <div>{appointTimeText(appointTimeData)}</div>
  {#if errors.length > 0}
    <div class="error">
      {#each errors as error}
        <div>{error.toString()}</div>
      {/each}
    </div>
  {/if}
  <div class="form">
    <div class="table-row">
      <div>患者名</div>
      <div>
        <div class="patient-name-form">
          <form on:submit|preventDefault={doPatientSearch}>
            <input
              type="text"
              class="patient-search-input"
              bind:value={searchText}
              use:setFocus
            />
          </form>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            width="20"
            class="search-icon"
            on:click={doPatientSearch}
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {#if patientSearchResult.length > 0}
          <div class="patient-search-result">
            {#each patientSearchResult as p (p.patientId)}
              <SelectItem2
                data={p}
                isCurrent={p.patientId === patient?.patientId ?? 0}
                onSelect={doPatientSelect}
              >
                {p.fullName()}
              </SelectItem2>
            {/each}
          </div>
        {/if}
      </div>
    </div>
    <div class="table-row">
      <div>患者番号</div>
      <div>
        {patient?.patientId ?? ""}
      </div>
    </div>
    <div class="table-row">
      <div>メモ</div>
      <div>
        <input type="text" class="memo-input" bind:value={memoInput} />
      </div>
    </div>
    <div class="table-row">
      <div>タグ</div>
      <div>
        <input type="checkbox" id={kenshinId} bind:checked={kenshinChecked} />
        <label for={kenshinId}>健診</label>
        {#if kenshinChecked && appointTimeData.followingVacant != undefined}
          <input type="checkbox" id={withRegularId} />
          <label for={withRegularId}>診察も</label>
        {/if}
      </div>
    </div>
  </div>
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={doClose}>キャンセル</button>
  </div>
</SurfaceModal>

<style>
  .error {
    color: red;
    margin: 10px;
  }

  .form {
    display: table;
    border-spacing: 0 4px;
  }

  .table-row {
    display: table-row;
  }

  .table-row > div {
    display: table-cell;
  }

  .table-row > div:first-of-type {
    text-align: right;
  }

  .table-row > div:nth-of-type(2) {
    padding-left: 10px;
    width: 200px;
  }

  .patient-name-form {
    display: flex;
    align-items: center;
  }

  .patient-search-result {
    margin: 10px 0;
    border: 1px solid gray;
    max-height: 6rem;
    overflow-y: auto;
  }

  .patient-search-result :global(.select-item) {
    line-height: 1;
    padding: 2px 4px;
  }

  input.patient-search-input {
    width: 8rem;
  }

  .search-icon {
    color: #999;
    margin-left: 4px;
    cursor: pointer;
  }

  .commands {
    display: flex;
    justify-content: right;
    margin-bottom: 4px;
  }

  .commands * + button {
    margin-left: 4px;
  }
</style>
