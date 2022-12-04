<script lang="ts">
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import * as kanjidate from "kanjidate";
  import { Kouhi, Koukikourei, Shahokokuho, type Patient } from "myclinic-model";
  import type { Readable } from "svelte/store";
  import type { Hoken } from "./hoken";

  export let patient: Readable<Patient>;
  export let hokenCache: Readable<Hoken[]>;
  export let ops: {
    close: () => void,
    moveToEdit: () => void,
    moveToNewShahokokuho: () => void,
    moveToNewKoukikourei: () => void,
    moveToNewKouhi: () => void,
    moveToShahokokuhoInfo: (d: Shahokokuho) => void,
    moveToKoukikoureiInfo: (d: Koukikourei) => void,
    moveToKouhiInfo: (d: Kouhi) => void,
  };

  function doCurrentClick(h: Hoken): void {
    if (h.value instanceof Shahokokuho) {
      ops.moveToShahokokuhoInfo(h.value);
    } else if (h.value instanceof Koukikourei) {
      ops.moveToKoukikoureiInfo(h.value);
    } else if (h.value instanceof Kouhi) {
      ops.moveToKouhiInfo(h.value);
    }
  }

  let today: Date = new Date();

  console.log($hokenCache)
</script>

<SurfaceModal destroy={ops.close} width="320px" height="auto" title="患者情報">
  {@const p = $patient}
  <div class="info">
    <span>患者番号</span><span>{p.patientId}</span>
    <span>氏名</span><span>{p.lastName} {p.firstName}</span>
    <span>よみ</span><span>{p.lastNameYomi} {p.firstNameYomi}</span>
    <span>生年月日</span><span
      >{kanjidate.format(kanjidate.f2, p.birthday)}</span
    >
    <span>性別</span><span>{p.sexAsKanji}性</span>
    <span>住所</span><span>{p.address}</span>
    <span>電話番号</span><span>{p.phone}</span>
  </div>
  <div class="current-list">
    {#each $hokenCache.filter(h => h.isValidAt(today)) as h (h.key)}
      <a href="javascript:void(0)" on:click={() => doCurrentClick(h)}>{h.rep}</a
      >
    {/each}
  </div>
  <div class="commands">
    <button>診察受付</button>
    <button on:click={ops.close}>閉じる</button>
  </div>
  <div class="menu">
    <a href="javascript:void(0)" on:click={() => ops.moveToEdit()}>編集</a>
    |
    <a href="javascript:void(0)" on:click={ops.moveToNewShahokokuho}
      >新規社保国保</a
    >
    |
    <a href="javascript:void(0)" on:click={ops.moveToNewKoukikourei}
      >新規後期高齢</a
    >
    |
    <a href="javascript:void(0)" on:click={ops.moveToNewKouhi}>新規公費</a> |
    <a href="javascript:void(0)">保険履歴</a> |
    <a href="javascript:void(0)">保存画像</a>
  </div>
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

  .current-list a + a {
    margin-left: 6px;
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
