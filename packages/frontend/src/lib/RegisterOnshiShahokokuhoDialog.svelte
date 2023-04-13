<script lang="ts">
  import type { Shahokokuho } from "myclinic-model";
  import Dialog from "./Dialog.svelte";
  import * as kanjidate from "kanjidate";
  import api from "./api";

  export let destroy: () => void;
  export let shahokokuho: Shahokokuho;
  export let onEnter: (entered: Shahokokuho) => void;

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
    const entered = await api.enterShahokokuho(shahokokuho);
    doClose();
    onEnter(entered);
  }

</script>

<Dialog destroy={doClose} title="新規社保国保登録">
  <div class="wrapper">
    <span>保険者番号</span><span>{shahokokuho.hokenshaBangou}</span>
    <span>被保険者記号</span><span>{shahokokuho.hihokenshaKigou}</span>
    <span>被保険者番号</span><span>{shahokokuho.hihokenshaBangou}</span>
    <span>枝番</span><span>{shahokokuho.edaban}</span>
    <span>本人・家族</span><span>{shahokokuho.honninStore !== 0 ? "本人" : "家族"}</span>
    {#if shahokokuho.koureiStore > 0}
    <span>高齢</span><span>{shahokokuho.koureiStore}割</span>
    {/if}
    <span>期限開始</span><span>{dateRep(shahokokuho.validFrom)}</span>
    <span>期限終了</span><span>{dateRep(shahokokuho.validUpto)}</span>
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
