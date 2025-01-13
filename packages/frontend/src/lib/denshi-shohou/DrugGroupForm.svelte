<script lang="ts">
  import type { 剤形区分 } from "./denshi-shohou";
  import type { EditMode } from "./drug-group-form/drug-group-form-types";
  import EditChouzaiSuuryouForm from "./drug-group-form/ChouzaiSuuryouForm.svelte";
  import EditUsageForm from "./drug-group-form/UsageForm.svelte";
  import EditZaikeiKubunForm from "./drug-group-form/ZaikeiKubunForm.svelte";
  import type {
    剤形レコード,
    用法レコード,
    用法補足レコード,
  } from "./presc-info";
  import UsageAdditionForm from "./drug-group-form/UsageAdditionForm.svelte";

  let 剤形区分: 剤形区分 = "内服";
  let 調剤数量: number | undefined = undefined;
  let 用法: 用法レコード | undefined = undefined;
  let 用法補足レコード: 用法補足レコード[] = [];
  let edit: EditMode | undefined = undefined;

  function doEnter() {
    if (調剤数量 == undefined) {
      alert("調剤数量が設定されていません。");
      return;
    } else if (!(調剤数量 > 0)) {
      alert("調剤数量の値が正の数値でありません。");
      return;
    }
    if (用法 == undefined) {
      alert("用法が設定されていません。");
      return;
    }
    const 剤形レコード: 剤形レコード = {
      剤形区分,
      調剤数量,
    };
    console.log("剤形レコード", 剤形レコード);
    console.log("用法", 用法);
  }

  function doEdit(mode: EditMode) {
    if (edit === mode) {
      edit = undefined;
    } else {
      edit = mode;
    }
  }

  function onDone剤形区分(value: 剤形区分) {
    剤形区分 = value;
    edit = undefined;
  }

  function onDone調剤数量(value: number) {
    調剤数量 = value;
    edit = undefined;
  }

  function onDone用法(value: 用法レコード) {
    用法 = value;
    edit = undefined;
  }

  function onDone用法補足レコード(value: 用法補足レコード[]) {
    用法補足レコード = value;
    edit = undefined;
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div>
  <div style="display:grid;grid-template-columns:auto 1fr;gap:6px;">
    <div class="title" on:click={() => doEdit("剤形区分")}>剤形区分</div>
    <div>{剤形区分}</div>
    <div class="title" on:click={() => doEdit("用法")}>用法</div>
    <div>
      {#if 用法}
        {用法.用法名称}
      {/if}
    </div>
    <div class="title" on:click={() => doEdit("調剤数量")}>調剤数量</div>
    <div>{調剤数量 ?? ""}</div>
    <div class="title" on:click={() => doEdit("用法補足レコード")}>用法補足</div>
    <div>
      <ul style="margin-top:0;margin-bottom:0;">
        {#each 用法補足レコード as hosoku}
          <li>{hosoku.用法補足区分}：{hosoku.用法補足情報}</li>
        {/each}
      </ul>
    </div>
  </div>
  <div>
    {#if edit === "剤形区分"}
      <div class="edit-title">剤形区分</div>
      <EditZaikeiKubunForm {剤形区分} onDone={onDone剤形区分} />
    {:else if edit === "調剤数量"}
      <div class="edit-title">調剤数量</div>
      <EditChouzaiSuuryouForm {調剤数量} onDone={onDone調剤数量} />
    {:else if edit === "用法"}
      <div class="edit-title">用法</div>
      <EditUsageForm {用法} onDone={onDone用法} />
    {:else if edit === "用法補足レコード"}
      <div class="edit-title">用法補足</div>
      <UsageAdditionForm {用法補足レコード} onDone={onDone用法補足レコード} />
    {/if}
  </div>
  <div style="margin-top:10px;padding:10px;text-align:right;">
    <button on:click={doEnter}>決定</button>
  </div>
</div>

<style>
  .title {
    user-select: none;
    cursor: pointer;
  }

  .edit-title {
    font-weight: bold;
    user-select: none;
  }
</style>
