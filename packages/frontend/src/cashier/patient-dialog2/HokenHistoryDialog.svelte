<script lang="ts">
  import { classify } from "@/lib/partition";
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import type { Patient } from "myclinic-model";
  import type { PatientData } from "../patient-dialog2/patient-data";
  import type { Hoken } from "./hoken";
  import ShahokokuhoBox from "./hoken-box/ShahokokuhoBox.svelte";
  import KoukikoureiBox from "./hoken-box/KoukikoureiBox.svelte";
  import RoujinBox from "./hoken-box/RoujinBox.svelte";
  import KouhiBox from "./hoken-box/KouhiBox.svelte";
  import EditHokenDialog from "./EditHokenDialog.svelte";
  import { confirm } from "@/lib/confirm-call";
  import { deleteHoken } from "./delete-hoken";

  export let data: PatientData;
  export let destroy: () => void;
  let patient: Patient = data.patient;

  let classified: Record<string, Hoken[]> = mkClassified(
    data.hokenCache.listAll()
  );

  function mkClassified(list: Hoken[]): Record<string, Hoken[]> {
    const c = classify(list, (h) => h.slug);
    Object.values(c).forEach((list: Hoken[]) => {
      list.sort(
        (a: Hoken, b: Hoken) => -a.validFrom.localeCompare(b.validFrom)
      );
    });
    return c;
  }

  function close(): void {
    destroy();
    data.goback();
  }

  function exit(): void {
    destroy();
    data.exit();
  }

  function doEdit(hoken: Hoken): void {
    function open(): void {
      const d: EditHokenDialog = new EditHokenDialog({
        target: document.body,
        props: {
          data,
          hoken,
          destroy: () => d.$destroy(),
        },
      });
    }
    destroy();
    data.push(open);
  }

  function doDelete(hoken: Hoken): void {
    confirm("この保険を削除していいですか？", async () => {
      const ok = await deleteHoken(hoken);
      if( !ok ){
        alert("保険の削除に失敗しました。");
        return;
      }
      data.hokenCache.remove(hoken.value);
      destroy();
      data.reopen();
    });
  }
</script>

<SurfaceModal destroy={exit} title="保険履歴" width="400px">
  <div>
    ({patient.patientId}) {patient.fullName(" ")}
  </div>
  <div class="hoken-list-wrapper">
    <div class="hoken-list">
      {#each Object.keys(classified) as hokenName}
        {#each classified[hokenName] as hoken (hoken.key)}
          {@const hokenType = hoken.slug}
          {@const usageCount = hoken.usageCount}
          <div class={`hoken-box ${hokenType}`}>
            {#if hokenType === "shahokokuho"}
              <ShahokokuhoBox shahokokuho={hoken.asShahokokuho} {usageCount} />
            {:else if hokenType === "koukikourei"}
              <KoukikoureiBox koukikourei={hoken.asKoukikourei} {usageCount} />
            {:else if hokenType === "roujin"}
              <RoujinBox roujin={hoken.asRoujin} {usageCount} />
            {:else if hokenType === "kouhi"}
              <KouhiBox kouhi={hoken.asKouhi} {usageCount} />
            {/if}
            {#if hoken.usageCount === 0}
              <a href="javascript:void(0)" on:click={() => doDelete(hoken)}>削除</a>
            {/if}
            {#if hokenType !== "roujin"}
              <button on:click={() => doEdit(hoken)}>編集</button>
            {/if}
          </div>
        {/each}
      {/each}
    </div>
  </div>
  <div class="commands">
    <button on:click={close}>閉じる</button>
  </div>
</SurfaceModal>

<style>
  .hoken-list-wrapper {
    max-height: 500px;
    overflow-y: auto;
    padding: 6px;
  }

  .hoken-list-wrapper::-webkit-scrollbar-corner {
    background: transparent;
  }

  .hoken-list {
    padding: 6px 0;
    padding: 4px 4px 0 4px;
  }

  .hoken-box {
    border-style: solid;
    border-width: 2px;
    border-radius: 6px;
    margin-bottom: 4px;
    padding: 4px;
  }

  .hoken-box.shahokokuho {
    border-color: blue;
  }

  .hoken-box.koukikourei {
    border-color: orange;
  }

  .hoken-box.roujin {
    border-color: yellow;
  }

  .hoken-box.kouhi {
    border-color: gray;
  }

  .commands {
    display: flex;
    justify-content: right;
    margin-top: 10px;
  }
</style>
