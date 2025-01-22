<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import type { Shohousen } from "@/lib/shohousen/parse-shohousen";
  import type { IyakuhinMaster, UsageMaster } from "myclinic-model";
  import type {
    DrugGroupFormInitExtent,
    Source,
    TargetUsage,
  } from "./denshi-henkan-dialog-types";
  import api from "@/lib/api";
  import {
    type RP剤情報,
    type 剤形レコード,
    type 用法レコード,
    type 薬品レコード,
  } from "@/lib/denshi-shohou/presc-info";
  import {
    freeStyleUsageCode,
    type 剤形区分,
  } from "@/lib/denshi-shohou/denshi-shohou";
  import { toHankaku } from "myclinic-rezept/zenkaku";
  import DrugGroupForm from "@/lib/denshi-shohou/DrugGroupForm.svelte";
  import { type DrugGroupFormInit } from "@/lib/denshi-shohou/drug-group-form-types";
  import { tick } from "svelte";
  import { cache } from "@/lib/cache";
  import type { DrugKind } from "@/lib/denshi-shohou/drug-group-form/drug-group-form-types";

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
  let mode: "edit-drug" | undefined = undefined;
  let editedSource: DrugGroupFormInit & DrugGroupFormInitExtent = {};

  sourceList = shohousenToSourceList(source);

  async function onFormEnter(rp: RP剤情報) {
    if (
      editedSource.用法レコード &&
      editedSource.用法レコード.用法コード === freeStyleUsageCode
    ) {
      if (rp.用法レコード.用法コード !== freeStyleUsageCode) {
        const u = editedSource.用法レコード.用法名称;
        const map = await cache.getUsageMasterMap();
        map[u] = Object.assign({}, rp.用法レコード);
        await cache.setUsageMasterMap(map);
      }
    }
    {
      const rec: 薬品レコード | undefined = rp.薬品情報グループ[0]?.薬品レコード;
      if (rec === undefined) {
        throw new Error("empty RP剤情報");
      }
      if( editedSource.sourceDrugName ){
        const drugName = editedSource.sourceDrugName;
        if( rec.薬品コード種別 === "レセプト電算処理システム用コード"){
          const map = await cache.getDrugNameIyakuhincodeMap();
          const bind = map[drugName];
          if( !bind || bind.toString() !== rec.薬品コード) {
            const newMap = { ...map };
            newMap[drugName] = parseInt(rec.薬品コード);
            await cache.setDrugNameIyakuhincodeMap(newMap);
            console.log("newMap", newMap);
          }
        }
      }
    }
    editedSource = {};
  }

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

  function shohousenToSourceList(shohousen: Shohousen): Source[] {
    const sourceList: Source[] = [];
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
    return sourceList;
  }

  function resolveParsed剤型区分(
    times: string | undefined
  ): 剤形区分 | undefined {
    if (times) {
      if (times.indexOf("日分") > 0) {
        return "内服";
      } else if (times.indexOf("回分") > 0) {
        return "頓服";
      } else {
        return "外用";
      }
    } else {
      return "外用";
    }
  }

  function resolveParsed調剤数量(
    times: string | undefined
  ): number | undefined {
    if (times) {
      let m = /([0-9０-９]+)(日|回)分$/.exec(times);
      if (m) {
        return parseInt(toHankaku(m[1]));
      }
    } else {
      return undefined;
    }
  }

  async function resolveParsed用法レコード(
    usage: string
  ): Promise<用法レコード | undefined> {
    const map = await cache.getUsageMasterMap();
    const rec = map[usage];
    if (rec) {
      return rec;
    } else {
      return {
        用法コード: freeStyleUsageCode,
        用法名称: usage,
      };
    }
  }

  function resolveParsedAmount(amount: string): number | undefined {
    const a = parseFloat(toHankaku(amount));
    return isNaN(a) ? undefined : a;
  }

  async function probeIyakuhincode(name: string): Promise<number | undefined> {
    const map = await cache.getDrugNameIyakuhincodeMap();
    return map[name] ?? undefined;
  }

  async function resolveParsedIyakuhin(
    name: string,
    amount: string
  ): Promise<
    | { 薬品レコード: 薬品レコード }
    | { drugKind: DrugKind }
    | { iyakuhinSearchText: string; amount: number | undefined }
  > {
    const amountValue = resolveParsedAmount(amount);
    const bind = await probeIyakuhincode(name);
    if (bind) {
      const master = await api.getIyakuhinMaster(bind, at);
      if (master) {
        if (amountValue !== undefined) {
          return {
            薬品レコード: {
              情報区分: "医薬品",
              薬品コード種別: "レセプト電算処理システム用コード",
              薬品コード: master.iyakuhincode.toString(),
              薬品名称: master.name,
              分量: amount.toString(),
              力価フラグ: "薬価単位",
              単位名: master.unit,
            },
          };
        }
      }
    }
    return {
      iyakuhinSearchText: name,
      amount: amountValue,
    };
  }

  async function sourceToInit(
    src: Source
  ): Promise<DrugGroupFormInit & DrugGroupFormInitExtent> {
    switch (src.kind) {
      case "parsed": {
        const amount = resolveParsedAmount(src.amount);
        return {
          剤形区分: resolveParsed剤型区分(src.times),
          調剤数量: resolveParsed調剤数量(src.times),
          用法レコード: await resolveParsed用法レコード(src.usage),
          ...(await resolveParsedIyakuhin(src.name, src.amount)),
          sourceDrugName: src.name,
        };
      }
      default: {
        return {};
      }
    }
  }

  async function doSourceSelect(src: Source) {
    if (src.kind === "parsed") {
      selectedSourceIndex = src.id;
      editedSource = await sourceToInit(src);
      mode = undefined;
      await tick();
      mode = "edit-drug";
    }
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
            <div>{source.times ?? ""}</div>
          {/if}
        </div>
      {/each}
    </div>
    <div>
      {#if mode === "edit-drug" && editedSource}
        <DrugGroupForm
          {at}
          {kouhiCount}
          init={editedSource}
          onEnter={onFormEnter}
        />
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
