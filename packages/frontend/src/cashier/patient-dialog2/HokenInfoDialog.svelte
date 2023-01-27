<script lang="ts">
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
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
  import EditHokenDialog from "./EditHokenDialog.svelte";
  import ShahokokuhoDialog from "./edit/ShahokokuhoDialog.svelte";
  import KoukikoureiDialog from "./edit/KoukikoureiDialog.svelte";
  import KouhiDialog from "./edit/KouhiDialog.svelte";
  import api from "@/lib/api";

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

  function close(): void {
    destroy();
    data.goback();
  }

  function exit(): void {
    destroy();
    data.exit();
  }

  function doEdit(): void {
    if (hoken.value instanceof Shahokokuho) {
      const shahokokuho = hoken.value;
      function open(): void {
        const d: ShahokokuhoDialog = new ShahokokuhoDialog({
          target: document.body,
          props: {
            init: shahokokuho,
            destroy: () => {
              d.$destroy();
              data.goback();
            },
            title: "社保国保編集",
            patient,
            onUpdated: (updated: Shahokokuho) => {
              data.hokenCache.updateWithHokenType(updated);
            },
          },
        });
      }
      destroy();
      data.push(open);
    } else if (hoken.value instanceof Koukikourei) {
      const koukikourei = hoken.value;
      function open(): void {
        const d: KoukikoureiDialog = new KoukikoureiDialog({
          target: document.body,
          props: {
            init: koukikourei,
            destroy: () => {
              d.$destroy();
              data.goback();
            },
            title: "後期高齢保険編集",
            patient,
            onUpdated: (updated: Koukikourei) => {
              data.hokenCache.updateWithHokenType(updated);
            },
          },
        });
      }
      destroy();
      data.push(open);
    } else if (hoken.value instanceof Kouhi) {
      const kouhi = hoken.value;
      function open(): void {
        const d: KouhiDialog = new KouhiDialog({
          target: document.body,
          props: {
            init: kouhi,
            destroy: () => {
              d.$destroy();
              data.goback();
            },
            title: "後期高齢保険編集",
            patient,
            onUpdated: (updated: Kouhi) => {
              data.hokenCache.updateWithHokenType(updated);
            },
          },
        });
      }
      destroy();
      data.push(open);
    }
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
</script>

<SurfaceModal destroy={exit} title={`${hoken.name}情報`}>
  <svelte:component this={panel} {patient} {hoken} />
  <div class="commands">
    {#if hoken.usageCount === 0}
      <a href="javascript:;" on:click={doDelete}>削除</a>
    {/if}
    {#if !(hoken.value instanceof Roujin)}
      <button on:click={doEdit}>編集</button>
    {/if}
    <button on:click={close}>閉じる</button>
  </div>
</SurfaceModal>

<style>
  .commands {
    margin-top: 10px;
    display: flex;
    justify-content: right;
    align-items: center;
  }

  .commands > * + * {
    margin-left: 4px;
  }
</style>
