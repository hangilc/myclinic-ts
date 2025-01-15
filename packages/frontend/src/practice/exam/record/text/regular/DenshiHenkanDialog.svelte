<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import type { Shohousen } from "@/lib/shohousen/parse-shohousen";
  import type { IyakuhinMaster, UsageMaster } from "myclinic-model";
  import type { Source, TargetUsage } from "./denshi-henkan-dialog-types";
  import api from "@/lib/api";
  import type {
    RP剤情報,
    剤形レコード,
    用法レコード,
  } from "@/lib/denshi-shohou/presc-info";
  import type { 剤形区分 } from "@/lib/denshi-shohou/denshi-shohou";
  import { toHankaku } from "myclinic-rezept/zenkaku";
  import DrugGroupForm from "@/lib/denshi-shohou/DrugGroupForm.svelte";

  export let destroy: () => void;
  export let source: Shohousen;
  export let at: string;
  export let kouhiCount: number;
  let sourceIndex = 1;
  let sourceList: Source[] = [];
  let selectedSourceIndex = 0;
  let targetIyakuhinMaster: IyakuhinMaster | undefined = undefined;
  let targetAmount = "";
  let targetAmountUnit = "";
  let targetUsage: TargetUsage | undefined = undefined;
  let target剤形区分: 剤形区分 = "内服";
  let drugSearchText = "";
  let drugSearchResult: IyakuhinMaster[] = [];
  let usageSearchText = "";
  let usageSearchResult: UsageMaster[] = [];
  const freeStyleUsageCode = "0X0XXXXXXXXX0000";
  let mode: "edit-drug" | undefined = undefined;
  let editedSource: Source | undefined = undefined;

  console.log("source", source);

  function compileResult(): RP剤情報[] {
    const rps: RP剤情報[] = [];
    sourceList.forEach((src) => {
      if (src.kind === "denshi") {
        rps.push(src.data);
      }
    });
    return rps;
  }

  function doRegister() {
    if (!targetIyakuhinMaster) {
      alert("薬剤名が設定されていません。");
      return;
    }
    const 調剤数量: number = parseFloat(toHankaku(targetAmount));
    if (isNaN(調剤数量)) {
      alert("用量の入力が数字でありません。");
      return;
    }
    if (!targetUsage) {
      alert("用法が設定されていません。");
      return;
    }
    let 用法コード: string;
    let 用法名称: string;
    if (targetUsage.kind === "master") {
      用法コード = targetUsage.master.usage_code;
      用法名称 = targetUsage.master.usage_name;
    } else if (targetUsage.kind === "free-style") {
      用法コード = freeStyleUsageCode;
      用法名称 = targetUsage.text;
    } else {
      throw new Error("cannot happen (targetUsage)");
    }
    const 剤形レコード: 剤形レコード = {
      剤形区分: target剤形区分,
      調剤数量,
    };
    const 用法レコード: 用法レコード = {
      用法コード,
      用法名称,
    };
    const rp: RP剤情報 = {
      剤形レコード,
      用法レコード,
      薬品情報グループ: [],
    };
    console.log("RP剤情報", rp);
  }

  source.parts.forEach((part) => {
    const drugs = part.drugs;
    const srcUsage = part.usage;
    let usage: string = "";
    let times: string | undefined = undefined;
    if (srcUsage) {
      usage = srcUsage.usage;
      times = srcUsage.days;
    } else if (part.more) {
      usage = part.more;
    }
    drugs.forEach((drug) => {
      const name = drug.name;
      const amount = drug.amount;
      sourceList.push({
        id: sourceIndex++,
        kind: "parsed",
        name,
        amount,
        usage,
        times,
      });
    });
  });

  async function doSearchDrug() {
    const t = drugSearchText.trim();
    if (t !== "") {
      drugSearchResult = await api.searchIyakuhinMaster(t, at);
    }
  }

  function doSourceSelect(src: Source) {
    if (src.kind === "parsed") {
      selectedSourceIndex = src.id;
      editedSource = src;
      mode = "edit-drug";
    }
  }

  function doIyakuhinMasterSelect(m: IyakuhinMaster) {
    targetIyakuhinMaster = m;
    targetAmountUnit = m.unit;
    drugSearchText = "";
    drugSearchResult = [];
  }

  async function doSearchUsage() {
    const t = usageSearchText.trim();
    if (t !== "") {
      usageSearchResult = await api.selectUsageMasterByUsageName(t);
    }
  }

  function doUsageMasterSelect(m: UsageMaster) {
    targetUsage = {
      kind: "master",
      master: m,
    };
    console.log("usageMaster", m);
    usageSearchText = "";
    usageSearchResult = [];
  }

  function doCancel() {
    destroy();
  }

  function targetUsageRep(target: TargetUsage | undefined): string {
    if (target) {
      switch (target.kind) {
        case "master": {
          return target.master.usage_name;
        }
        case "free-style": {
          return target.text;
        }
        default: {
          throw new Error("cannot happen (targetUsageRep)");
        }
      }
    } else {
      return "";
    }
  }

  async function trySetTargetUsage(src: string) {
    targetUsage = undefined;
    let t = "";
    switch (src) {
      case "分１　寝る前": {
        t = "１日１回就寝前　服用";
        break;
      }
    }
    if (t !== "") {
      const r = await api.selectUsageMasterByUsageName(t);
      if (r.length === 1) {
        targetUsage = { kind: "master", master: r[0] };
      }
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<Dialog title="処方箋電子変換" {destroy} styleWidth="600px">
  <div style="display:grid;grid-template-columns:200px 1fr;gap:10px;">
    <div style="font-size:14px;">
      {#each sourceList as source (source.id)}
        <div
          class="drug"
          class:selected={source.id === selectedSourceIndex}
          on:click={() => doSourceSelect(source)}
        >
          {#if source.kind === "parsed"}
            <div>{source.name}</div>
            <div>{source.amount}</div>
            <div>{source.usage}</div>
          {/if}
        </div>
      {/each}
    </div>
    <div>
      {#if mode === "edit-drug" && editedSource}
        <DrugGroupForm {at} {kouhiCount} init={({})}/>
      {/if}
    </div>
  </div>
  <div style="text-align:right;">
    <button on:click={doCancel}>キャンセル</button>
  </div>
</Dialog>

<style>
  .drug {
    border: 1px solid gray;
    border-radius: 4px;
    margin: 6px 0;
    padding: 6px;
    cursor: pointer;
  }

  .drug:first-of-type {
    margin-top: 0;
  }

  .drug:last-of-type {
    margin-bottom: 0;
  }

  .selected {
    border: 2px solid blue;
  }
</style>
