<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import { Appoint, AppointTime, type AppEvent } from "myclinic-model";
  import { formatDate } from "./helper";
  import * as kanjidate from "kanjidate";

  export let destroy: () => void;
  export let events: AppEvent[];
  export let appointTimeMap: Record<number, AppointTime>;

  function kindRep(kind: string): string {
    switch(kind) {
      case "created": return "作成";
      case "updated": return "変更";
      case "deleted": return "削除";
      default: return kind;
    }
  }

  function formatMemo(memo: string): string {
    return memo.replace(/{{.*}}/, "");
  }

  function formatCreatedAt(at: string): string {
    return kanjidate.format(kanjidate.f9, at);
  }
</script>

<Dialog {destroy} title="変更履歴">
  <div class="result">
    {#each events as e (e.appEventId)}
      {#if e.model === "appoint"}
        {@const a=Appoint.cast(JSON.parse(e.data))}
        {@const at=appointTimeMap[a.appointTimeId]}
        <div class="item">
          【{kindRep(e.kind)}】
          {formatDate(at.date)}
          {at.fromTime} - {at.untilTime}
          <span class="patient-name">{a.patientName}</span>
          {#if a.patientId > 0}
          ({a.patientId})
          {/if}
          <span>{formatMemo(a.memo)}</span>
          {#each a.tags as tag}
          <span>{tag}</span>
          {/each}
          ({formatCreatedAt(e.createdAt)})
        </div> 
      {/if}
    {/each}
  </div>
  <div class="commands">
    <button on:click={destroy}>閉じる</button>
  </div>
</Dialog>

<style>
  .result {
    max-height: 20rem;
    min-width: 24rem;
    max-width: 24rem;
    overflow-y: auto;
    resize: vertical;
    margin: 10px 0;
  }

  .item {
    margin: 10px 0;
  }

  .item:first-of-type {
    margin-top: 0;
  }

  .item:last-of-type {
    margin-bottom: 0;
  }

  .patient-name {
    font-weight: bold;
    color: blue;
  }

  .commands {
    display: flex;
    justify-content: right;
  }
</style>
