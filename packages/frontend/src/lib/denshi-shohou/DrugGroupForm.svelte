<script lang="ts">
  import type { 剤形区分, 情報区分 } from "./denshi-shohou";
  import type {
    DrugKind,
    EditMode,
  } from "./drug-group-form/drug-group-form-types";
  import EditChouzaiSuuryouForm from "./drug-group-form/ChouzaiSuuryouForm.svelte";
  import EditUsageForm from "./drug-group-form/UsageForm.svelte";
  import EditZaikeiKubunForm from "./drug-group-form/ZaikeiKubunForm.svelte";
  import type {
    RP剤情報,
    薬品情報,
    薬品レコード,
    剤形レコード,
    用法レコード,
    用法補足レコード,
    不均等レコード,
  } from "./presc-info";
  import UsageAdditionForm from "./drug-group-form/UsageAdditionForm.svelte";
  import JohoKubunForm from "./drug-group-form/JohoKubunForm.svelte";
  import DrugKindForm from "./drug-group-form/DrugKindForm.svelte";
  import AmountForm from "./drug-group-form/AmountForm.svelte";
  import UnevenForm from "./drug-group-form/UnevenForm.svelte";

  export let at: string;
  let 剤形区分: 剤形区分 = "内服";
  let 調剤数量: number | undefined = undefined;
  let 用法レコード: 用法レコード | undefined = undefined;
  let 用法補足レコード: 用法補足レコード[] = [];
  let 情報区分: 情報区分 = "医薬品";
  let drugKind: DrugKind | undefined = undefined;
  let amount: number | undefined = undefined;
  let 不均等レコード: 不均等レコード | undefined = undefined;
  let edit: EditMode | undefined = undefined;

  function doEnter() {
    if (調剤数量 == undefined) {
      alert("調剤数量が設定されていません。");
      return;
    } else if (!(調剤数量 > 0)) {
      alert("調剤数量の値が正の数値でありません。");
      return;
    }
    if (用法レコード == undefined) {
      alert("用法が設定されていません。");
      return;
    }
    if (!(剤形区分 === "内服" || 剤形区分 === "頓服")) {
      調剤数量 = 1;
    }
    if( !drugKind ) {
      alert("薬剤種別が設定されていません。");
      return;
    }
    if( amount == undefined ){
      alert("用量が設定されていません。");
      return;
    }
    const 剤形レコード: 剤形レコード = {
      剤形区分,
      調剤数量,
    };
    const 薬品レコード: 薬品レコード = {
      情報区分,
      薬品コード種別: drugKind.薬品コード種別,
      薬品コード: drugKind.薬品コード,
      薬品名称: drugKind.薬品名称,
      分量: amount.toString(),
      力価フラグ: "薬価単位",
      単位名: drugKind.単位名,
    };
    const 薬品情報: 薬品情報 = {
      薬品レコード,
      不均等レコード,
    };
    const rp: RP剤情報 = {
      剤形レコード,
      用法レコード,
      用法補足レコード:
        用法補足レコード.length === 0 ? undefined : 用法補足レコード,
      薬品情報グループ: [薬品情報],
    };
    console.log("RP剤情報", rp);
  }

  function timesRep(kubun: 剤形区分): string {
    switch (kubun) {
      case "内服":
        return "日分";
      case "頓服":
        return "回分";
      default:
        return "";
    }
  }

  function unevenRep(rec: 不均等レコード | undefined): string {
    if( rec ){
      const parts: string[] = [
        rec.不均等１回目服用量,
        rec.不均等２回目服用量,
      ];
      if( rec.不均等３回目服用量 != undefined ){
        parts.push(rec.不均等３回目服用量)
      }
      if( rec.不均等４回目服用量 != undefined ){
        parts.push(rec.不均等４回目服用量)
      }
      if( rec.不均等５回目服用量 != undefined ){
        parts.push(rec.不均等５回目服用量)
      }
      return parts.join("-");
    } else {
      return "";
    }
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
    用法レコード = value;
    edit = undefined;
  }

  function onDone用法補足レコード(value: 用法補足レコード[]) {
    用法補足レコード = value;
    edit = undefined;
  }

  function onDone情報区分(value: 情報区分) {
    情報区分 = value;
    edit = undefined;
  }

  function onDone薬剤種別(value: DrugKind) {
    drugKind = value;
    edit = undefined;
  }

  function onDone用量(value: number) {
    amount = value;
    edit = undefined;
  }

  function onDone不均等レコード(value: 不均等レコード | undefined) {
    不均等レコード = value;
    edit = undefined;
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div>
  <div style="display:grid;grid-template-columns:auto 1fr;gap:6px;">
    <div class="title" on:click={() => doEdit("情報区分")}>情報区分</div>
    <div>{情報区分}</div>
    <div class="title" on:click={() => doEdit("剤形区分")}>剤形区分</div>
    <div>{剤形区分}</div>
    <div class="title" on:click={() => doEdit("薬剤種別")}>薬剤種別</div>
    <div>{drugKind ? drugKind.薬品名称 : ""}</div>
    <div class="title" on:click={() => doEdit("用量")}>用量</div>
    <div>{amount ?? ""} {drugKind?.単位名 ?? ""}</div>
    <div class="title" on:click={() => doEdit("用法レコード")}>用法</div>
    <div>
      {#if 用法レコード}
        {用法レコード.用法名称}
      {/if}
    </div>
    {#if 剤形区分 === "内服" || 剤形区分 === "頓服"}
      <div class="title" on:click={() => doEdit("調剤数量")}>調剤数量</div>
      <div>{調剤数量 ?? ""} {timesRep(剤形区分)}</div>
    {/if}
    <div class="title" on:click={() => doEdit("用法補足レコード")}>
      用法補足
    </div>
    <div>
      <ul style="margin-top:0;margin-bottom:0;">
        {#each 用法補足レコード as hosoku}
          <li>{hosoku.用法補足区分}：{hosoku.用法補足情報}</li>
        {/each}
      </ul>
    </div>
    <div class="title" on:click={() => doEdit("不均等レコード")}>不均等</div>
    <div>{unevenRep(不均等レコード)}</div>
  </div>
  <div>
    {#if edit === "剤形区分"}
      <div class="edit-title">剤形区分</div>
      <EditZaikeiKubunForm {剤形区分} onDone={onDone剤形区分} />
    {:else if edit === "調剤数量"}
      <div class="edit-title">調剤数量</div>
      <EditChouzaiSuuryouForm {調剤数量} onDone={onDone調剤数量} />
    {:else if edit === "用法レコード"}
      <div class="edit-title">用法</div>
      <EditUsageForm 用法={用法レコード} onDone={onDone用法} />
    {:else if edit === "用法補足レコード"}
      <div class="edit-title">用法補足</div>
      <UsageAdditionForm {用法補足レコード} onDone={onDone用法補足レコード} />
    {:else if edit === "情報区分"}
      <div class="edit-title">情報区分</div>
      <JohoKubunForm {情報区分} onDone={onDone情報区分} />
    {:else if edit === "薬剤種別"}
      <div class="edit-title">薬剤種別</div>
      <DrugKindForm {drugKind} {at} onDone={onDone薬剤種別} />
    {:else if edit === "用量"}
      <div class="edit-title">用量</div>
      <AmountForm {amount} unit={drugKind?.単位名 ?? ""} onDone={onDone用量} />
    {:else if edit === "不均等レコード"}
      <div class="edit-title">不均等</div>
      <UnevenForm 不均等レコード={不均等レコード} onDone={onDone不均等レコード} />
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
