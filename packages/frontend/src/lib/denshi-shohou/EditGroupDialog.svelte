<script lang="ts">
  import ChevronDown from "@/icons/ChevronDown.svelte";
  import Dialog from "../Dialog.svelte";
  import type { 剤形区分 } from "./denshi-shohou";
  import { amountDisp } from "./disp/disp-util";
  import NewDrugForm from "./NewDrugForm.svelte";
  import type {
    RP剤情報,
    用法レコード,
    薬品レコード,
    薬品情報,
    剤形レコード,
  } from "./presc-info";
  import SearchUsageMasterDialog from "./SearchUsageMasterDialog.svelte";
  import type { UsageMaster } from "myclinic-model";
  import { toHankaku } from "../zenkaku";
  import EditDrugDialog from "./EditDrugDialog.svelte";

  export let destroy: () => void;
  export let at: string;
  export let group: RP剤情報 | undefined;
  export let onEnter: (group: RP剤情報) => void;
  export let onDelete: (() => void) | undefined = undefined;
  let zaikeiKubun: 剤形区分 = group?.剤形レコード.剤形区分 ?? "内服";
  let drugs: 薬品情報[] = group?.薬品情報グループ ?? [];
  let usageRecord: 用法レコード | undefined = group?.用法レコード ?? undefined;
  let timesText = group?.剤形レコード.調剤数量.toString() ?? "";
  let showZaikeiAux = false;
  let showNewDrugForm = false;
  let title = group ? "薬剤グループ編集" : "新規薬剤グループ";

  function doUsageMasterSearch() {
    const d: SearchUsageMasterDialog = new SearchUsageMasterDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        onEnter: (m: UsageMaster) => {
          usageRecord = {
            用法コード: m.usage_code,
            用法名称: m.usage_name,
          };
        },
      },
    });
  }

  function indexRep(i: number): string {
    return String.fromCharCode("a".charCodeAt(0) + i);
  }

  function resolve調剤数量(): number | string {
    let times = 1;
    if (zaikeiKubun === "内服" || zaikeiKubun === "頓服") {
      timesText = timesText.trim();
      timesText = toHankaku(timesText);
      if (!/^\d+$/.test(timesText)) {
        return `${zaikeiKubun === "内服" ? "日数" : "回数"}の入力が不適切ですｓ。`;
      }
      times = parseInt(timesText);
    }
    return times;
  }

  function doEnter() {
    let times = resolve調剤数量();
    if (typeof times === "string") {
      alert(times);
      return;
    }
    let 剤形レコード: 剤形レコード = {
      剤形区分: zaikeiKubun,
      調剤数量: times,
    };
    if (!usageRecord) {
      alert("用法が設定されていません。");
      return;
    }
    if (drugs.length === 0) {
      alert("薬品が設定されていません。");
      return;
    }
    let group: RP剤情報 = {
      剤形レコード,
      用法レコード: usageRecord,
      薬品情報グループ: drugs,
    };
    destroy();
    onEnter(group);
  }

  function doDelete() {
    if( group && onDelete && confirm("この薬剤グループを削除していいですか？") ){
      destroy();
      onDelete();
    }
  }

  function doEditDrug(drug: 薬品情報) {
    const d: EditDrugDialog = new EditDrugDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        drug,
        at,
        onEnter: (newDrug) => {
          drugs = drugs.map(d => d === drug ? newDrug : d)
        },
        onDelete: drugs.length <= 1 ? undefined : () => {
          drugs = drugs.filter(d => d !== drug);
        },
        zaikei: zaikeiKubun,
      }
    })
  }
</script>

<Dialog {title} {destroy} styleWidth="400px">
  <div class="data-wrapper">
    <div>剤型：</div>
    <div>
      <input type="radio" bind:group={zaikeiKubun} value="内服" />内服
      <input type="radio" bind:group={zaikeiKubun} value="頓服" />頓服
      <input type="radio" bind:group={zaikeiKubun} value="外用" />外用
      <a
        href="javascript:void(0)"
        on:click={() => (showZaikeiAux = !showZaikeiAux)}
        style="position:relative;top:2px;margin-left:3px;"><ChevronDown /></a
      >
      {#if showZaikeiAux}
        <div>
          <input
            type="radio"
            bind:group={zaikeiKubun}
            value="内服滴剤"
          />内服滴剤
          <input type="radio" bind:group={zaikeiKubun} value="注射" />注射
          <input
            type="radio"
            bind:group={zaikeiKubun}
            value="医療材料"
          />医療材料
          <input type="radio" bind:group={zaikeiKubun} value="不明" />不明
        </div>
      {/if}
    </div>
    <div>薬剤：</div>
    <div>
      <div class="drugs-wrapper">
        {#each drugs as drug, i}
          <div>{indexRep(i)})</div>
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div style="cursor:pointer" on:click={() => doEditDrug(drug)}>
            {drug.薬品レコード.薬品名称}
            {amountDisp(drug.薬品レコード)}
          </div>
        {/each}
      </div>
      <div style="margin-top:0px;">
        <a
          href="javascript:void(0)"
          on:click={() => {
            showNewDrugForm = !showNewDrugForm;
          }}
          style="font-size:0.9rem">薬剤追加</a
        >
        {#if showNewDrugForm}
          <div
            style="margin:10px 0;border:1px solid gray;border-radius:4px;padding:10px;"
          >
            <NewDrugForm
              onCancel={() => {
                showNewDrugForm = false;
              }}
              {at}
              onEnter={(drug) => {
                drugs.push(drug);
                drugs = drugs;
                showNewDrugForm = false;
              }}
              zaikei={zaikeiKubun}
            />
          </div>
        {/if}
      </div>
    </div>
    <div>用法：</div>
    <div>
      {usageRecord ? usageRecord.用法名称 : "（未設定）"}
      <a
        href="javascript:void(0)"
        on:click={doUsageMasterSearch}
        style="font-size:0.9rem">マスター検索</a
      >
    </div>
    {#if zaikeiKubun === "内服" || zaikeiKubun === "頓服"}
      <div>{zaikeiKubun === "内服" ? "日数" : "回数"}：</div>
      <div>
        <input type="text" style="width:3rem" bind:value={timesText} />
        {zaikeiKubun === "内服" ? "日分" : "回分"}
      </div>
    {/if}
  </div>
  <div style="margin-top:10px;text-align:right">
    {#if group && onDelete }
      <a href="javascript:void(0)" on:click={doDelete}>削除</a>
    {/if}
    <button
      on:click={doEnter}
      disabled={!(
        drugs.length > 0 &&
        usageRecord &&
        (((zaikeiKubun === "内服" || zaikeiKubun === "頓服") && timesText) ||
          !(zaikeiKubun === "内服" || zaikeiKubun === "頓服"))
      )}>入力</button
    >
    <button on:click={destroy}>キャンセル</button>
  </div>
</Dialog>

<style>
  .data-wrapper {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px;
  }

  .drugs-wrapper {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px;
  }
</style>
