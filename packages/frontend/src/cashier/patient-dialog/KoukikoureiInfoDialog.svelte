<script lang="ts">
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import { dateToSqlDate, type Patient, type Koukikourei } from "myclinic-model";
  import type { Readable } from "svelte/store";
  import * as kanjidate from "kanjidate";
  import { toZenkaku } from "@/lib/zenkaku";
  import { onDestroy } from "svelte";
  import { koukikoureiUpdated } from "@/app-events";
  import { kouhiInfoOpener } from "./openers/kouhi-info-opener";
  import { confirm } from "@/lib/confirm-call";
  import api from "@/lib/api";

  export let patient: Readable<Patient>;
  export let koukikourei: Koukikourei;
  export let usageCount: number;
  export let ops: {
    goback: () => void,
    moveToEdit: () => void,
    renew: (s: Koukikourei) => void,
  };

  const unsubs: (() => void)[] = [];

  unsubs.push(
    koukikoureiUpdated.subscribe((s) => {
      if (s == null) {
        return;
      }
      if (s.koukikoureiId === koukikourei.koukikoureiId) {
        console.log("updated", s);
        koukikourei = s;
      }
    })
  );

  onDestroy(() => {
    unsubs.forEach((u) => u());
  });

  function formatValidFrom(sqldate: string): string {
    return kanjidate.format(kanjidate.f2, sqldate);
  }

  function formatValidUpto(sqldate: string): string {
    if (sqldate === "0000-00-00") {
      return "（期限なし）";
    } else {
      return kanjidate.format(kanjidate.f2, sqldate);
    }
  }

  function doRenew(): void {
    if( koukikourei.validUpto !== "0000-00-00") {
      const d = new Date(koukikourei.validUpto);
      d.setDate(d.getDate() + 1);
      const s = Object.assign({}, koukikourei, {
        koukikoureiId: 0,
        validFrom: dateToSqlDate(d),
        validUpto: "0000-00-00"
      }) as Koukikourei;
      ops.renew(s);
    } else {
      alert("期限終了日が設定されていないので、更新できません。");
      return;
    }
  }

  async function doDelete() {
    if( koukikourei !== undefined ){
      confirm("この保険を削除していいですか？", async () => {
        await api.deleteKoukikourei(koukikourei.koukikoureiId);
        ops.goback();
      })
    }
  }
</script>

<SurfaceModal destroy={ops.goback} title="後期高齢">
  <div class="panel">
    <span>({$patient.patientId})</span>
    <span>{$patient.fullName(" ")}</span>
    <span>保険者番号</span>
    <span>{koukikourei.hokenshaBangou}</span>
    <span>被保険者番号</span>
    <span>{koukikourei.hihokenshaBangou}</span>
    <span>負担割</span>
    <span>{toZenkaku(koukikourei.futanWari.toString())}割</span>
    <span>期限開始</span>
    <span>{formatValidFrom(koukikourei.validFrom)}</span>
    <span>期限終了</span>
    <span>{formatValidUpto(koukikourei.validUpto)}</span>
    <span>使用回数</span>
    <span>{usageCount}回</span>
  </div>
  <div class="commands">
    {#if usageCount === 0}
      <a href="javascript:void(0)" on:click={doDelete}>削除</a>
    {/if}
    {#if koukikourei.validUpto !== "0000-00-00"}
      <button on:click={doRenew}>更新</button>
    {/if}
    <button on:click={ops.moveToEdit}>編集</button>
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
    align-items: center;
    margin: 0;
    margin-bottom: 10px;
  }

  .commands * + * {
    margin-left: 4px;
  }
</style>
