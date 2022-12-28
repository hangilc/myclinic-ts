<script lang="ts">
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import type { KanjiDate } from "kanjidate";
  import type { AppointTimeData } from "./appoint-time-data";
  import * as kanjidate from "kanjidate";
  import { genid } from "@/lib/genid";

  export let destroy: () => void;
  export let title: string;
  export let appointTimeData: AppointTimeData;
  const kenshinId = genid();
  const withRegularId = genid();

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

  function doClose(): void {
    destroy();
  }
</script>

<SurfaceModal {destroy} {title}>
  <div>{appointTimeText(appointTimeData)}</div>
  <div class="form">
    <div class="table-row">
      <div>患者名</div>
      <div>
        <input type="text" class="patient-search-input" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
          width="20"
          class="search-icon"
        >
        <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
      </div>
    </div>
    <div class="table-row">
      <div>患者番号</div>
      <div />
    </div>
    <div class="table-row">
      <div>メモ</div>
      <div>
        <input type="text" class="memo-input" />
      </div>
    </div>
    <div class="table-row">
      <div>タグ</div>
      <div>
        <input type="checkbox" id={kenshinId}/>
        <label for={kenshinId}>健診</label>
        <input type="checkbox" id={withRegularId}/>
        <label for={withRegularId}>診察も</label>
      </div>
    </div>
  </div>
  <div class="commands">
    <button>入力</button>
    <button on:click={doClose}>キャンセル</button>
  </div>
</SurfaceModal>

<style>
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
    display: flex;
    align-items: center;
    width: 200px;
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
