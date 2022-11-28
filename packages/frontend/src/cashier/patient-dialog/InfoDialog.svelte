<script lang="ts">
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import * as kanjidate from "kanjidate";
  import type { PatientData } from "./patient-data";

  export let patientData: PatientData | undefined = undefined;
  export let onClose: () => void = () => {};
</script>

<SurfaceModal
  on:close
  width="320px"
  height="auto"
  title="患者情報"
  {onClose}
>
  {#if patientData}
    {@const p = patientData.patient}
    <div class="info">
      <span>患者番号</span><span>{p.patientId}</span>
      <span>氏名</span><span>{p.lastName} {p.firstName}</span>
      <span>よみ</span><span>{p.lastNameYomi} {p.firstNameYomi}</span>
      <span>生年月日</span><span
        >{kanjidate.format(kanjidate.f2, p.birthday)}</span
      >
      <span>性別</span><span>{p.sexAsKanji}性</span>
      <span>住所</span><span>{p.address}</span>
      <span>電話</span><span>{p.phone}</span>
    </div>
    <div class="current-list">
      {#each patientData.currentHokenList as h}
        <a href="javascript:void(0)">{h.rep}</a>
      {/each}
    </div>
    <div class="commands">
      <button>診察受付</button>
      <button>閉じる</button>
    </div>
    <div class="menu">
      <a href="javascript:void(0)">編集</a> | 
      <a href="javascript:void(0)">新規社保国保</a> | 
      <a href="javascript:void(0)">新規後期高齢</a> | 
      <a href="javascript:void(0)">新規公費</a> | 
      <a href="javascript:void(0)">保険履歴</a> | 
      <a href="javascript:void(0)">保存画像</a>
    </div>
  {/if}
</SurfaceModal>

<style>
  .info {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .info *:nth-child(odd) {
    display: flex;
    align-items: center;
    justify-content: right;
    margin-right: 6px;
  }

  .current-list {
    margin: 10px 0 0 0;
  }

  .commands {
    display: flex;
    justify-content: right;
    margin: 0;
    margin-bottom: 10px;
  }

  .commands * + * {
    margin-left: 4px;
  }

  .menu a {
    word-break: keep-all;
  }
</style>
