<script lang="ts">
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import {
    dateToSqlDate,
    type Patient,
    type Shahokokuho,
  } from "myclinic-model";
  import type { Readable } from "svelte/store";
  import * as kanjidate from "kanjidate";
  import { toZenkaku } from "@/lib/zenkaku";
  import { onDestroy } from "svelte";
  import { shahokokuhoUpdated } from "@/app-events";
  import { confirm } from "@/lib/confirm-call";
  import api from "@/lib/api";

  export let patient: Readable<Patient>;
  export let shahokokuho: Shahokokuho;
  export let usageCount: number;
  export let ops: {
    goback: () => void;
    moveToEdit: () => void;
    renew: (s: Shahokokuho) => void;
  };

  const unsubs: (() => void)[] = [];

  unsubs.push(
    shahokokuhoUpdated.subscribe((s) => {
      if (s == null) {
        return;
      }
      if (s.shahokokuhoId === shahokokuho.shahokokuhoId) {
        console.log("updated", s);
        shahokokuho = s;
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

  function formatKourei(kourei: number): string {
    if (kourei === 0) {
      return "高齢でない";
    } else {
      return `${toZenkaku(kourei.toString())}割`;
    }
  }

  function doRenew(): void {
    if (shahokokuho.validUpto !== "0000-00-00") {
      const d = new Date(shahokokuho.validUpto);
      d.setDate(d.getDate() + 1);
      const s = Object.assign({}, shahokokuho, {
        shahokokuhoId: 0,
        validFrom: dateToSqlDate(d),
        validUpto: "0000-00-00",
      }) as Shahokokuho;
      ops.renew(s);
    } else {
      alert("期限終了日が設定されていないので、更新できません。");
      return;
    }
  }

  async function doDelete() {
    if (shahokokuho != undefined) {
      confirm("この保険を削除していいですか？", async () => {
        await api.deleteShahokokuho(shahokokuho.shahokokuhoId);
        ops.goback();
      });
    }
  }
</script>

<SurfaceModal destroy={ops.goback} title="社保国保">
  <div class="panel">
    <span>({$patient.patientId})</span>
    <span>{$patient.fullName(" ")}</span>
    <span>保険者番号</span>
    <span>{shahokokuho.hokenshaBangou}</span>
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
    <span>使用回数</span>
    <span>{usageCount}回</span>
  </div>
  <div class="commands">
    {#if usageCount === 0}
      <a href="javascript:void(0)" on:click={doDelete}>削除</a>
    {/if}
    {#if shahokokuho.validUpto !== "0000-00-00"}
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
