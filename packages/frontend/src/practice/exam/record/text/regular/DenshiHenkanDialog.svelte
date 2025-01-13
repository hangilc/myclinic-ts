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
      drugSearchText = src.name;
      selectedSourceIndex = src.id;
      trySetTargetUsage(src.usage);
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
      switch(target.kind) {
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

<Dialog title="処方箋電子変換" {destroy} styleWidth="600px">
  <div style="display:grid;grid-template-columns:200px 1fr;gap:6px;">
    <div style="font-size:14px;">
      {#each sourceList as source (source.id)}
        {#if source.kind === "parsed"}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            class="source"
            class:selected={source.id === selectedSourceIndex}
            on:click={() => doSourceSelect(source)}
          >
            <div>{source.name}</div>
            <div>{source.amount}</div>
            <div>{source.usage}</div>
          </div>
        {:else}
          <div>DATA</div>
        {/if}
      {/each}
    </div>
    <div>
      <DrugGroupForm {at} {kouhiCount} />
      <!-- <div style="display:grid;grid-template-columns:auto 1fr;gap:6px;">
        <div>薬剤名</div>
        <div>{targetIyakuhinMaster ? targetIyakuhinMaster.name : ""}</div>
        <div>分量</div>
        <div>
          <input type="text" style="width:3em" bind:value={targetAmount} />
          {targetAmountUnit}
        </div>
        <div>用法</div>
        <div>{targetUsageRep(targetUsage)}</div>
      </div>
      <div style="text-align:right;">
        <button on:click={doRegister}>追加</button>
      </div>
      <hr style="margin:10px 0;grid-column:span 2;" />
      <div style="font-weight:bold;">薬剤選択</div>
      <div>
        <input type="text" bind:value={drugSearchText} />
        <button on:click={doSearchDrug}>検索</button>
        <div>
          {#each drugSearchResult as result (result.iyakuhincode)}
            <div
              style="cursor:pointer;"
              on:click={() => doIyakuhinMasterSelect(result)}
            >
              {result.name}
            </div>
          {/each}
        </div>
      </div>
      <div style="font-weight:bold;">用法選択</div>
      <div>
        <input type="text" bind:value={usageSearchText} />
        <button on:click={doSearchUsage}>検索</button>
        {#each usageSearchResult as result (result.usage_code)}
          <div
            style="cursor:pointer;"
            on:click={() => doUsageMasterSelect(result)}
          >
            {result.usage_name}
          </div>
        {/each} 
      </div> -->
    </div>
  </div>
  <div style="text-align:right;">
    <button on:click={doCancel}>キャンセル</button>
  </div>
</Dialog>

<style>
  .source {
    border: 1px solid gray;
    border-radius: 4px;
    margin: 6px 0;
    padding: 6px;
    cursor: pointer;
  }

  .selected {
    border: 2px solid blue;
  }
</style>
