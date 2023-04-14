<script lang="ts">
  import type { Koukikourei } from "myclinic-model";
  import Dialog from "./Dialog.svelte";
  import * as kanjidate from "kanjidate";
  import api from "./api";

  export let destroy: () => void;
  export let koukikourei: Koukikourei;
  export let onEnter: (entered: Koukikourei) => void;

  function doClose(): void {
    destroy();
  }

  function dateRep(s: string): string {
    if( s === "0000-00-00" ){
      return "なし";
    } else {
      return kanjidate.format(kanjidate.f2, s);
    }
  }

  async function doEnter() {
    const entered = await api.enterKoukikourei(koukikourei);
    doClose();
    onEnter(entered);
  }

</script>

<Dialog destroy={doClose} title="新規後期高齢保険登録">
  <div class="wrapper">
    <span>保険者番号</span><span>{koukikourei.hokenshaBangou}</span>
    <span>被保険者番号</span><span>{koukikourei.hihokenshaBangou}</span>
    <span>負担割</span><span>{koukikourei.futanWari}割</span>
    <span>期限開始</span><span>{dateRep(koukikourei.validFrom)}</span>
    <span>期限終了</span><span>{dateRep(koukikourei.validUpto)}</span>
  </div>
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={doClose}>キャンセル</button>
  </div>
</Dialog>

<style>
  .wrapper {
    display:grid;
    grid-template-columns: auto 1fr;
    align-items: center;
  }

  .wrapper > *:nth-child(odd) {
    margin-right: 10px;
  }

  .commands {
    display: flex;
    justify-content: right;
    margin-top: 10px;
  }

  .commands * + * {
    margin-left: 4px;
  }
  </style>
