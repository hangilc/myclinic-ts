<script lang="ts">
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import { dateToSqlDate, type Patient, type Kouhi } from "myclinic-model";
  import type { Readable } from "svelte/store";
  import * as kanjidate from "kanjidate";
  import { onDestroy } from "svelte";
  import { kouhiUpdated } from "@/app-events";

  export let patient: Readable<Patient>;
  export let kouhi: Kouhi;
  export let ops: {
    goback: () => void,
    moveToEdit: () => void,
    renew: (s: Kouhi) => void,
  };

  const unsubs: (() => void)[] = [];

  unsubs.push(
    kouhiUpdated.subscribe((s) => {
      if (s == null) {
        return;
      }
      if (s.kouhiId === kouhi.kouhiId) {
        console.log("updated", s);
        kouhi = s;
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
    if( kouhi.validUpto !== "0000-00-00") {
      const d = new Date(kouhi.validUpto);
      d.setDate(d.getDate() + 1);
      const s = Object.assign({}, kouhi, {
        kouhiId: 0,
        validFrom: dateToSqlDate(d),
        validUpto: "0000-00-00"
      }) as Kouhi;
      ops.renew(s);
    } else {
      alert("期限終了日が設定されていないので、更新できません。");
      return;
    }
  }
</script>

<SurfaceModal destroy={ops.goback} title="後期高齢">
  <div class="panel">
    <span>({$patient.patientId})</span>
    <span>{$patient.fullName(" ")}</span>
    <span>負担者番号</span>
    <span>{kouhi.futansha}</span>
    <span>受給者番号</span>
    <span>{kouhi.jukyuusha}</span>
    <span>期限開始</span>
    <span>{formatValidFrom(kouhi.validFrom)}</span>
    <span>期限終了</span>
    <span>{formatValidUpto(kouhi.validUpto)}</span>
  </div>
  <div class="commands">
    {#if kouhi.validUpto !== "0000-00-00"}
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
    margin: 0;
    margin-bottom: 10px;
  }

  .commands * + * {
    margin-left: 4px;
  }
</style>
