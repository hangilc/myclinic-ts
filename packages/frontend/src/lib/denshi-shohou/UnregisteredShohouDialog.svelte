<script lang="ts">
  import Dialog from "../Dialog.svelte";
  import { toZenkaku } from "../zenkaku";
  import { amountDisp, daysTimesDisp, usageDisp } from "./disp/disp-util";
  import NewGroupDialog from "./NewGroupDialog.svelte";
  import type { PrescInfoData } from "./presc-info";

  export let destroy: () => void;
  export let title: string;
  export let shohou: PrescInfoData;
  export let onDestroy: () => void;
  export let at: string;

  function doDestroy() {
    if (confirm("この処方を削除していいですか？")) {
      destroy();
      onDestroy();
    }
  }

  function doNewGroup() {
    const d: NewGroupDialog = new NewGroupDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        at,
      }
    })
  }
</script>

<Dialog {title} {destroy}>
  <div>院外処方</div>
  <div>Ｒｐ）</div>
  <div class="groups-wrapper">
    {#each shohou.RP剤情報グループ as group, i}
      <div>{toZenkaku((i + 1).toString())}）</div>
      <div>
        <div>
          {#each group.薬品情報グループ as drug}
            <div>{drug.薬品レコード.薬品名称} {amountDisp(drug.薬品レコード)}</div>
          {/each}
        </div>
        <div>{usageDisp(group)} {daysTimesDisp(group)}</div>
      </div>
    {/each}
  </div>
  <div>
    <a href="javascript:void(0)" on:click={doNewGroup}>新規グループ</a>
  </div>
  
  <div class="commands">
    <button on:click={doDestroy}>削除</button>
    <button on:click={destroy}>閉じる</button>
  </div>
</Dialog>

<style>
    .groups-wrapper {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 4px;
    }
  .commands {
    margin-top: 10px;
    text-align: right;
  }
</style>
