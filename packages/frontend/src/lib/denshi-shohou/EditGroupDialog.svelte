<script lang="ts">
  import ChevronDown from "@/icons/ChevronDown.svelte";
  import Dialog from "../Dialog.svelte";
  import type { 剤形区分 } from "./denshi-shohou";
  import { drugDisp, usageDisp } from "./disp/disp-util";
  import type {
    RP剤情報,
    用法レコード,
    薬品情報,
    剤形レコード,
    用法補足レコード,
  } from "./presc-info";
  import SearchUsageMasterDialog from "./SearchUsageMasterDialog.svelte";
  import type { UsageMaster } from "myclinic-model";
  import { toHankaku } from "../zenkaku";
  import EditDrugDialog from "./EditDrugDialog.svelte";
  import FreeStyleUsageDialog from "./FreeStyleUsageDialog.svelte";
  import UsageAdditionalsForm from "./UsageAdditionalsForm.svelte";

  export let destroy: () => void;
  export let at: string;
  export let group: RP剤情報 | undefined;
  export let onEnter: (group: RP剤情報) => void;
  export let onDelete: (() => void) | undefined = undefined;
  let zaikeiKubun: 剤形区分 = group?.剤形レコード.剤形区分 ?? "内服";
  let drugs: 薬品情報[] = group?.薬品情報グループ ?? [];
  let usageRecord: 用法レコード | undefined = group?.用法レコード ?? undefined;
  let timesText = group?.剤形レコード.調剤数量.toString() ?? "";
  let usageAdditionals: 用法補足レコード[] | undefined =
    group?.用法補足レコード ?? undefined;
  let showZaikeiAux = false;
  let title = group ? "薬剤グループ編集" : "新規薬剤グループ";
  let showUsageAdditionals = false;

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

  function doFreeStyleUsage() {
    const d: FreeStyleUsageDialog = new FreeStyleUsageDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        onEnter: (text) => {
          usageRecord = {
            用法コード: "“ 0X0XXXXXXXXX0000",
            用法名称: text,
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
      用法補足レコード: usageAdditionals,
    };
    destroy();
    onEnter(group);
  }

  function doDelete() {
    if (
      group &&
      onDelete &&
      confirm("この薬剤グループを削除していいですか？")
    ) {
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
          console.log("newDrug", newDrug);
          drugs = drugs.map((d) => (d === drug ? newDrug : d));
        },
        onDelete:
          drugs.length <= 1
            ? undefined
            : () => {
                drugs = drugs.filter((d) => d !== drug);
              },
        zaikei: zaikeiKubun,
      },
    });
  }

  function doAddDrug() {
    const d: EditDrugDialog = new EditDrugDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        drug: undefined,
        at,
        onEnter: (newDrug) => {
          drugs = [...drugs, newDrug];
        },
        onDelete: undefined,
        zaikei: zaikeiKubun,
      },
    });
  }

  function doToggleUsageAdditionals() {
    showUsageAdditionals = !showUsageAdditionals;
  }

  function setUsageAdditionals(records: 用法補足レコード[] | undefined) {
    usageAdditionals = records;
    showUsageAdditionals = false;
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
            {drugDisp(drug)}
          </div>
        {/each}
      </div>
      <div style="margin-top:0px;">
        <a
          href="javascript:void(0)"
          on:click={doAddDrug}
          style="font-size:0.9rem">薬剤追加</a
        >
      </div>
    </div>
    <div>用法：</div>
    <div>
      {usageRecord ? usageDisp({ 用法レコード: usageRecord, 用法補足レコード: usageAdditionals }) : "（未設定）"}
      <div>
        <a
          href="javascript:void(0)"
          on:click={doUsageMasterSearch}
          style="font-size:0.9rem">マスター検索</a
        >
        <a
          href="javascript:void(0)"
          style="font-size:0.9rem"
          on:click={doFreeStyleUsage}>自由文章</a
        >
        <a
          href="javascript:void(0)"
          style="font-size:0.9rem"
          on:click={doToggleUsageAdditionals}>用法補足</a
        >
        {#if showUsageAdditionals}<UsageAdditionalsForm records={usageAdditionals} onEnter={setUsageAdditionals}/>{/if}
      </div>
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
    {#if group && onDelete}
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
