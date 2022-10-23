<script lang="ts">
  import { ConductKindObject, type ConductEx, type ConductKindTag, type VisitEx } from "@/lib/model";
  import Widget from "@/lib/Widget.svelte";
  import { confirm } from "@/lib/confirm-call"
  import api from "@/lib/api";
  import AddShinryou from "./AddShinryou.svelte"
  import AddDrug from "./AddDrug.svelte"
    import AddKizai from "./AddKizai.svelte";

  export let conduct: ConductEx;
  export let visit: VisitEx;
  export let onClose: () => void;
  let widget: Widget;
  let addShinryou: AddShinryou;
  let addDrug: AddDrug;
  let addKizai: AddKizai;

  $: console.log("conduct changed (edit)", conduct);

  export function open(): void {
    widget.open();
  }

  function kindRep(kindTag: ConductKindTag): string {
    return ConductKindObject.fromTag(kindTag).rep;
  }

  function doDelete(close: () => void): void {
    confirm("この処置を削除していいですか？", async () => {
      await api.deleteConductEx(conduct.conductId);
      close();
    });
  }

  function doAddShinryou(): void {
    addShinryou.open();
  }

  function doAddDrug(): void {
    addDrug.open();
  }

  function doAddKizai(): void {
    addKizai.open();
  }
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<Widget title="処置編集" let:close={close} onClose={onClose} bind:this={widget}>
  <div>[{kindRep(conduct.kind)}]</div>
  <div class="enterCommands">
    <a href="javascript:void(0)" on:click={doAddShinryou}>診療行為追加</a>
    <a href="javascript:void(0)" on:click={doAddDrug}>薬剤追加</a>
    <a href="javascript:void(0)" on:click={doAddKizai}>器材追加</a>
  </div>
  <div>
    <AddShinryou bind:this={addShinryou} conductId={conduct.conductId} visit={visit} />
    <AddDrug bind:this={addDrug} conductId={conduct.conductId} visit={visit} />
    <AddKizai bind:this={addKizai} conductId={conduct.conductId} visit={visit} />
  </div>
  {#each conduct.shinryouList as shinryou (shinryou.conductShinryouId)}
    <div>* {shinryou.master.name}</div>
  {/each}
  {#each conduct.drugs as drug (drug.conductDrugId)}
    <div>* {drug.master.name} {drug.amount}{drug.master.unit}</div>
  {/each}
  {#each conduct.kizaiList as kizai (kizai.conductKizaiId)}
    <div>* {kizai.master.name} {kizai.amount}{kizai.master.unit}</div>
  {/each}
  <svelte:fragment slot="commands">
    <button on:click={() => doDelete(close)}>削除</button>
    <button on:click={close}>閉じる</button>
  </svelte:fragment>
</Widget>