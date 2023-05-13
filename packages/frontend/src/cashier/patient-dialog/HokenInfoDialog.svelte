<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import {
    Kouhi,
    Koukikourei,
    Roujin,
    Shahokokuho,
    type Patient,
  } from "myclinic-model";
  import { Hoken } from "./hoken";
  import ShahokokuhoInfo from "./info/ShahokokuhoInfo.svelte";
  import KoukikoureiInfo from "./info/KoukikoureiInfo.svelte";
  import RoujinInfo from "./info/RoujinInfo.svelte";
  import KouhiInfo from "./info/KouhiInfo.svelte";
  import type { PatientData } from "./patient-data";
  import api from "@/lib/api";
  import { editHoken } from "./edit-hoken";
  import { dateToSql } from "@/lib/util";
  import OnshiKakuninDialog from "@/lib/OnshiKakuninDialog.svelte";
  import { countInvalidUsage } from "@/lib/hoken-check";

  export let data: PatientData;
  export let hoken: Hoken;
  export let destroy: () => void;
  let patient: Patient = data.patient;
  let panel = Hoken.fold(
    hoken.value,
    (_) => ShahokokuhoInfo,
    (_) => KoukikoureiInfo,
    (_) => RoujinInfo,
    (_) => KouhiInfo
  );
  let invalidUsage: number = 0;

  checkInvalidUsage();

  async function checkInvalidUsage() {
    if( hoken ){
      invalidUsage = await countInvalidUsage(hoken.value);
    }
  }

  function close(): void {
    destroy();
    data.goback();
  }

  function exit(): void {
    destroy();
    data.exit();
  }

  function doEdit(): void {
    editHoken(data, patient, destroy, hoken);
  }

  async function doDelete() {
    if (hoken.usageCount > 0) {
      alert("この保険はすでに使用されているので、削除できません。");
    } else {
      if (confirm("この保険を削除していいですか？")) {
        if (hoken.value instanceof Shahokokuho) {
          await api.deleteShahokokuho(hoken.value.shahokokuhoId);
          data.hokenCache.remove(hoken.value);
          destroy();
          data.goback();
        } else if (hoken.value instanceof Koukikourei) {
          await api.deleteKoukikourei(hoken.value.koukikoureiId);
          data.hokenCache.remove(hoken.value);
          destroy();
          data.goback();
        } else if (hoken.value instanceof Kouhi) {
          await api.deleteKouhi(hoken.value.kouhiId);
          data.hokenCache.remove(hoken.value);
          destroy();
          data.goback();
        }
      }
    }
  }

  async function doOnshiConfirm(hoken: Hoken) {
    const value = hoken.value;
    if (value instanceof Shahokokuho || value instanceof Koukikourei) {
      let confirmDate: string;
      if( hoken.validUpto === "0000-00-00" ){
        confirmDate = dateToSql(new Date());
      } else {
        confirmDate = hoken.validUpto;
      }
      const d: OnshiKakuninDialog = new OnshiKakuninDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          hoken: value,
          confirmDate,
        }
      });
    }
  }
</script>

<Dialog destroy={exit} title={`${hoken.name}情報`}>
  {#if invalidUsage > 0}
  <div class="warning">有効期間外に使用されています。</div>
  {/if}
  <svelte:component this={panel} {patient} {hoken} />
  <div class="commands">
    {#if hoken.isShahokokuho || hoken.isKoukikourei}
      <a href="javascript:;" on:click={() => doOnshiConfirm(hoken)}>資格確認</a>
    {/if}
    {#if hoken.usageCount === 0}
      <a href="javascript:;" on:click={doDelete}>削除</a>
    {/if}
    {#if !(hoken.value instanceof Roujin)}
      <button on:click={doEdit}>編集</button>
    {/if}
    <button on:click={close}>閉じる</button>
  </div>
</Dialog>

<style>
  .warning {
    margin: 10px 0;
    color: red;
  }

  .commands {
    margin-top: 10px;
    display: flex;
    justify-content: right;
    align-items: center;
  }

  .commands > * + * {
    margin-left: 4px;
  }

  .commands > a + button {
    margin-left: 10px;
  }
</style>
