<script lang="ts">
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import type { Patient, Shahokokuho } from "myclinic-model";
  import type { Readable } from "svelte/store";
  import * as kanjidate from "kanjidate";
  import { toZenkaku } from "@/lib/zenkaku";

  export let patient: Readable<Patient>;
  export let shahokokuho: Shahokokuho;
  export let ops: {
    goback: () => void
  };

  function formatValidFrom(sqldate: string): string {
    return kanjidate.format(kanjidate.f2, sqldate);
  }

  function formatValidUpto(sqldate: string): string {
    if( sqldate === "0000-00-00" ){
      return "（期限なし）";
    } else {
      return kanjidate.format(kanjidate.f2, sqldate);
    }
  }

  function formatKourei(kourei: number): string {
    if( kourei === 0 ){
      return "高齢でない"
    } else {
      return `${toZenkaku(kourei.toString())}割`;
    }
  }

</script>

<SurfaceModal destroy={ops.goback} title="社保国保" >
  <div class="panel">
    <span>({$patient.patientId})</span>
    <span>{$patient.fullName(" ")}</span>
    <span>保険者番号</span>
    <span>{shahokokuho.hihokenshaBangou}</span>
    <span>記号・番号</span>
    <span>
      {#if shahokokuho.hihokenshaKigou !== ""}
        {shahokokuho.hihokenshaKigou}・
      {/if}
      {shahokokuho.hihokenshaBangou}
    </span>
    <span>枝番</span>
    <span>{shahokokuho.edaban}</span>
    <span>本人・家族</span>
    <span>{shahokokuho.honnninKazokuType.rep}</span>
    <span>期限開始</span>
    <span>{formatValidFrom(shahokokuho.validFrom)}</span>
    <span>期限終了</span>
    <span>{formatValidUpto(shahokokuho.validUpto)}</span>
    <span>高齢</span>
    <span>{formatKourei(shahokokuho.koureiStore)}</span>
  </div>
  <div class="commands">
    <button>更新</button>
    <button>編集</button>
    <button on:click={ops.goback}>閉じる</button>
  </div>
</SurfaceModal>

<style>
  .panel {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .panel > *:nth-child(odd) {
    display: flex;
    align-items: center;
    justify-content: right;
    margin-right: 6px;
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
</style>