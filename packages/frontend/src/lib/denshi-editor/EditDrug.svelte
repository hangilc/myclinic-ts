<script lang="ts">
  import type {
    剤形区分,
    情報区分,
    薬品コード種別,
    力価フラグ,
  } from "@/lib/denshi-shohou/denshi-shohou";
  import type { 薬品情報, 薬品レコード } from "../denshi-shohou/presc-info";
  import { validateDrug } from "./helper";
  import { toHankaku } from "@/lib/zenkaku";
  import DrugForm from "./DrugForm.svelte";

  export let drug: 薬品情報;
  export let 剤形区分: 剤形区分;
  export let onEnter: (created: 薬品情報) => void;
  export let onDelete: () => void;
  export let onDone: () => void;
  export let at: string;

  let 情報区分: 情報区分 = drug.薬品レコード.情報区分;
  let 薬品コード種別: 薬品コード種別 = drug.薬品レコード.薬品コード種別;
  let 薬品コード: string = drug.薬品レコード.薬品コード;
  let 薬品名称: string = drug.薬品レコード.薬品名称;
  let 分量: string = drug.薬品レコード.分量;
  let 力価フラグ: 力価フラグ = drug.薬品レコード.力価フラグ;
  let 単位名: string = drug.薬品レコード.単位名;

  function doEnter() {
    let record: 薬品レコード = {
      情報区分,
      薬品コード種別,
      薬品コード,
      薬品名称,
      分量: toHankaku(分量),
      力価フラグ,
      単位名,
    };
    let err = validateDrug(record);
    if (typeof err === "string") {
      alert(err);
      return;
    }
    let data: 薬品情報 = {
      薬品レコード: record,
    };
    onEnter(data);
    onDone();
  }

  function doCancel() {
    onDone();
  }

  function doDelete() {
    if (confirm("この薬剤を削除していいですか？")) {
      onDelete();
      onDone();
    }
  }
</script>

<div>薬剤編集</div>
<DrugForm
  {at}
  bind:剤形区分
  bind:情報区分
  bind:薬品コード種別
  bind:薬品コード
  bind:薬品名称
  bind:分量
  bind:単位名
/>
<div class="commands">
  <!-- svelte-ignore a11y-invalid-attribute -->
  <a href="javascript:void(0)" on:click={doDelete}>削除</a>
  <button on:click={doEnter}>入力</button>
  <button on:click={doCancel}>キャンセル</button>
</div>

<style>
  .commands {
    text-align: right;
  }
</style>
