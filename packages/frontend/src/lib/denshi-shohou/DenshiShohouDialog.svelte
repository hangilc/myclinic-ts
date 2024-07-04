<script lang="ts">
  import Dialog from "../Dialog.svelte";
  import type { RP剤情報, 薬品情報 } from "./presc-info";
  import ShohouForm from "./ShohouForm.svelte";

  export let destroy: () => void;
  export let prescRecords: 薬品情報[] = [];
  export let at: string;

  let records: { id: number; presc: 薬品情報 }[] = prescRecords.map(
    (r, id) => ({
      id,
      presc: r,
    })
  );

  function doCancel() {
    destroy();
  }

  function doNew(drug: RP剤情報) {
    console.log("drug", drug);
  }
</script>

<Dialog title="処方入力" {destroy}>
  <div class="top">
    <div>
      {#each records as record (record.id)}{/each}
    </div>
    <div class="new-entry">
      <ShohouForm {at} let:enter onEnter={doNew}>
        <button on:click={enter}>Enter</button>
        </ShohouForm>
    </div>
    <div class="commands">
      <button on:click={doCancel}>キャンセル</button>
    </div>
  </div>
</Dialog>

<style>
  .top {
    width: 360px;
  }
  .new-entry {
    margin: 10px 0;
  }
  .commands {
    text-align: right;
    margin-top: 10px;
  }
</style>
