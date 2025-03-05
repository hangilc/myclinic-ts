<script lang="ts">
  import type { IyakuhinMaster, KizaiMaster, Kouhi } from "myclinic-model";
  import {
  ippanmeiStateFromMaster,
    type DrugGroupFormInitExtent,
    type Init,
    type IppanmeiState,
    type Mode,
    type Source,
  } from "./denshi-shohou-form/denshi-shohou-form-types";
  import DenshiMenu from "./denshi-shohou-form/DenshiMenu.svelte";
  import type {
    PrescInfoData,
    RP剤情報,
    備考レコード,
    提供情報レコード,
    用法レコード,
    薬品レコード,
  } from "./presc-info";
  import type { DrugGroupFormInit } from "./drug-group-form-types";
  import { tick } from "svelte";
  import type { Shohousen } from "@/lib/shohousen/parse-shohousen";
  import { kouhiRep } from "@/lib/hoken-rep";
  import {
    freeStyleUsageCode,
    type 剤形区分,
    type 情報区分,
  } from "./denshi-shohou";
  import { toHankaku } from "@/lib/zenkaku";
  import { cache } from "@/lib/cache";
  import api from "../api";
  import ParsedRep from "./denshi-shohou-form/ParsedRep.svelte";
  import DenshiRep from "./denshi-shohou-form/DenshiRep.svelte";
  import { 使用期限年月日Rep } from "./denshi-shohou-form/denshi-henkan-dialog-helper";
  import DrugGroupForm from "./DrugGroupForm.svelte";
  import ExpireDateForm from "./denshi-shohou-form/ExpireDateForm.svelte";
  import BikouForm from "./denshi-shohou-form/BikouForm.svelte";
  import JohoForm from "./denshi-shohou-form/JohoForm.svelte";
  import Circle from "@/icons/Circle.svelte";

  export let init: Init;
  export let at: string;
  export let kouhiList: Kouhi[];

  let sourceIndex = 1;
  export let sourceList: Source[];
  let selectedSourceId = -1;
  let mode: Mode | undefined = undefined;
  let editedSource: (DrugGroupFormInit & DrugGroupFormInitExtent) | undefined = undefined;
  let 使用期限年月日: string | undefined = resolve使用期限年月日FromInit(init);
  let 備考レコード: 備考レコード[] | undefined =
    resolve備考レコードFromInit(init);
  let 提供情報レコード: 提供情報レコード | undefined =
    resolve提供情報レコードFromInit(init);

  sourceList = prepareSourceList(init);

  async function reset() {
    mode = undefined;
    editedSource = undefined;
    selectedSourceId = -1;
    await tick();
  }

  async function changeModeTo(m: Mode) {
    await reset();
    mode = m;
  }

  function resolve使用期限年月日FromInit(init: Init): string | undefined {
    switch (init.kind) {
      case "parsed": {
        return undefined;
      }
      case "denshi": {
        return init.data.使用期限年月日;
      }
      default: {
        throw new Error("cannot happen");
      }
    }
  }

  function resolve備考レコードFromInit(init: Init): 備考レコード[] | undefined {
    switch (init.kind) {
      case "parsed": {
        return undefined;
      }
      case "denshi": {
        return init.data.備考レコード;
      }
      default: {
        throw new Error("cannot happen");
      }
    }
  }

  function resolve提供情報レコードFromInit(
    init: Init
  ): 提供情報レコード | undefined {
    switch (init.kind) {
      case "parsed": {
        return undefined;
      }
      case "denshi": {
        return init.data.提供情報レコード;
      }
      default: {
        throw new Error("cannot happen");
      }
    }
  }

  function prepareSourceList(
    source:
      | { kind: "parsed"; shohousen: Shohousen }
      | { kind: "denshi"; data: PrescInfoData }
  ): Source[] {
    if (source.kind === "parsed") {
      return prepareSourceListFromShohousen(source.shohousen);
    } else {
      return prepareSourceListFromDenshi(source.data);
    }
  }

  function prepareSourceListFromDenshi(data: PrescInfoData): Source[] {
    const list: Source[] = data.RP剤情報グループ.map((g) => {
      if (g.薬品情報グループ.length !== 1) {
        throw new Error("invalid number of drug groups");
      }
      let ippanmeiState: IppanmeiState | undefined;
      if (
        g.薬品情報グループ[0].薬品レコード.薬品コード種別 === "一般名コード"
      ) {
        ippanmeiState = { kind: "is-ippanmei" };
      } else {
        ippanmeiState = undefined;
      }
      let src: Source = {
        kind: "denshi",
        剤形レコード: g.剤形レコード,
        用法レコード: g.用法レコード,
        用法補足レコード: g.用法補足レコード,
        薬品情報: g.薬品情報グループ[0],
        id: sourceIndex++,
        ippanmeiState,
      };
      if (ippanmeiState === undefined) {
        if (
          g.薬品情報グループ[0].薬品レコード.薬品コード種別 ===
          "レセプト電算処理システム用コード"
        ) {
          const iyakuhincode = parseInt(
            g.薬品情報グループ[0].薬品レコード.薬品コード
          );
          spawnIppanmeiResolver(src.id, iyakuhincode);
        }
      }
      return src;
    });
    return list;
  }

  function prepareSourceListFromShohousen(shohousen: Shohousen): Source[] {
    const sourceList: Source[] = [];
    shohousen.parts.forEach((part) => {
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

  function resolveParsed剤形区分(
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
    | { iyakuhinSearchText: string; amount: number | undefined }
  > {
    const amountValue = resolveParsedAmount(amount);
    const bind = await probeIyakuhincode(name);
    if (bind) {
      let master: IyakuhinMaster | KizaiMaster | undefined = undefined;
      let 情報区分: 情報区分 = "医薬品";
      const code = bind.toString();
      if (code.startsWith("6")) {
        master = await api.getIyakuhinMaster(bind, at);
      } else if (code.startsWith("7")) {
        master = await api.getKizaiMaster(bind, at);
        情報区分 = "医療材料";
      }
      if (master) {
        if (amountValue !== undefined) {
          return {
            薬品レコード: {
              情報区分,
              薬品コード種別: "レセプト電算処理システム用コード",
              薬品コード: code,
              薬品名称: master.name,
              分量: amount,
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
        const resolved = await resolveParsedIyakuhin(
          src.name,
          amount?.toString() ?? ""
        );
        let 剤形区分: 剤形区分 | undefined = resolveParsed剤形区分(src.times);
        if ("薬品レコード" in resolved) {
          const code = resolved.薬品レコード.薬品コード;
          if (code.startsWith("7")) {
            剤形区分 = "医療材料";
            if (
              resolved.薬品レコード.薬品名称.startsWith(
                "万年筆型注入器用注射針"
              )
            ) {
              resolved.薬品レコード.単位名 = "本";
            }
          } else {
            const name = resolved.薬品レコード.薬品名称;
            if (
              name.startsWith("ランタス注ソロスター") ||
              name.startsWith("アピドラ注ソロスター")
            ) {
              剤形区分 = "注射";
            }
          }
        }
        return {
          剤形区分,
          調剤数量: resolveParsed調剤数量(src.times),
          用法レコード: await resolveParsed用法レコード(src.usage),
          ...resolved,
          sourceDrugName: src.name,
        };
      }
      case "denshi": {
        return {
          剤形区分: src.剤形レコード.剤形区分,
          調剤数量: src.剤形レコード.調剤数量,
          用法レコード: src.用法レコード,
          用法補足レコード: src.用法補足レコード,
          薬品レコード: src.薬品情報.薬品レコード,
          不均等レコード: src.薬品情報.不均等レコード,
          負担区分レコード: src.薬品情報.負担区分レコード,
          薬品補足レコード: src.薬品情報.薬品補足レコード,
          ippanmeiState: src.ippanmeiState,
        };
      }
      default: {
        return {};
      }
    }
  }

  async function doSourceSelect(src: Source) {
    editedSource = await sourceToInit(src);
    selectedSourceId = src.id;
    mode = undefined;
    await tick();
    mode = "edit-drug";
  }

  async function doNew() {
    await reset();
    mode = "new-drug";
  }

  async function spawnIppanmeiResolver(srcId: number, iyakuhincode: number) {
    let m = await api.getIyakuhinMaster(iyakuhincode, at);
    let ippanmeiState: IppanmeiState = ippanmeiStateFromMaster(m);
    sourceList = sourceList.map((src) => {
      if (
        src.id === srcId &&
        src.kind === "denshi" &&
        src.薬品情報.薬品レコード.薬品コード種別 ===
          "レセプト電算処理システム用コード" &&
        src.薬品情報.薬品レコード.薬品コード === iyakuhincode.toString()
      ) {
        src.ippanmeiState = ippanmeiState;
      }
      return src;
    });
  }

  function rpToSource(
    rp: RP剤情報,
    ippanmeiState: IppanmeiState | undefined
  ): Source {
    let src: Source = {
      kind: "denshi",
      剤形レコード: rp.剤形レコード,
      用法レコード: rp.用法レコード,
      用法補足レコード: rp.用法補足レコード,
      薬品情報: rp.薬品情報グループ[0],
      id: sourceIndex++,
      ippanmeiState,
    };
    if (
      ippanmeiState === undefined &&
      src.薬品情報.薬品レコード.薬品コード種別 ===
        "レセプト電算処理システム用コード"
    ) {
      const iyakuhincode = parseInt(src.薬品情報.薬品レコード.薬品コード);
      spawnIppanmeiResolver(src.id, iyakuhincode);
    }
    return src;
  }

  async function onFormEnter(
    rp: RP剤情報,
    ippanmeiState: IppanmeiState | undefined
  ) {
    if (
      editedSource &&
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
      const rec: 薬品レコード | undefined =
        rp.薬品情報グループ[0]?.薬品レコード;
      if (rec === undefined) {
        throw new Error("empty RP剤情報");
      }
      if (editedSource?.sourceDrugName) {
        const drugName = editedSource.sourceDrugName;
        if (rec.薬品コード種別 === "レセプト電算処理システム用コード") {
          const map = await cache.getDrugNameIyakuhincodeMap();
          const bind = map[drugName];
          if (!bind || bind.toString() !== rec.薬品コード) {
            const newMap = { ...map };
            newMap[drugName] = parseInt(rec.薬品コード);
            await cache.setDrugNameIyakuhincodeMap(newMap);
            console.log("newMap", newMap);
          }
        }
      }
    }
    sourceList = sourceList.map((src) => {
      if (src.id === selectedSourceId) {
        return rpToSource(rp, ippanmeiState);
      } else {
        return src;
      }
    });
    await reset();
  }

  async function onFormCancel() {
    await reset();
  }

  function doDelete() {
    sourceList = sourceList.filter((s) => s.id !== selectedSourceId);
    reset();
  }

  async function onNewDrug(
    rp: RP剤情報,
    ippanmeiState: IppanmeiState | undefined
  ) {
    sourceList.push(rpToSource(rp, ippanmeiState));
    sourceList = sourceList;
    await reset();
  }

  function onExpireDateDone(d: string | undefined) {
    使用期限年月日 = d;
    console.log("expireDate", 使用期限年月日);
    mode = undefined;
  }

  function onBikouDone(recs: 備考レコード[]) {
    備考レコード = recs.length > 0 ? recs : undefined;
    mode = undefined;
  }

  function onJohoDone(rec: 提供情報レコード | undefined) {
    提供情報レコード = rec;
    mode = undefined;
  }

  function isAllConverted(list: Source[]): boolean {
    for (let src of list) {
      if (src.kind !== "denshi") {
        return false;
      }
    }
    return true;
  }

  export function getPrescInfoData(): PrescInfoData {
    if (isAllConverted(sourceList)) {
      const drugs: RP剤情報[] = [];
      sourceList.forEach((ele) => {
        if (ele.kind === "denshi") {
          const rp: RP剤情報 = {
            剤形レコード: ele.剤形レコード,
            用法レコード: ele.用法レコード,
            用法補足レコード: ele.用法補足レコード,
            薬品情報グループ: [ele.薬品情報],
          };
          drugs.push(rp);
        }
      });
      let data: PrescInfoData;
      if (init.kind === "parsed") {
        data = init.template;
      } else if (init.kind === "denshi") {
        data = init.data;
      } else {
        throw new Error("cannot happen");
      }
      data = Object.assign({}, data);
      data.使用期限年月日 = 使用期限年月日;
      data.備考レコード = 備考レコード;
      data.RP剤情報グループ = drugs;
      data.提供情報レコード = 提供情報レコード;
      return data;
    } else {
      throw new Error("not all drugs are denshi");
    }
  }

  function ippanmeiSymbolSpec(ippanmeiState: IppanmeiState): {
    stroke: string;
    fill: string;
    fillOpacity?: string;
  } {
    switch (ippanmeiState.kind) {
      case "is-ippanmei": {
        return {
          stroke: "blue",
          fill: "blue",
        };
      }
      case "has-ippanmei": {
        return {
          stroke: "blue",
          fill: "none",
        };
      }
      case "has-no-ippanmei": {
        return {
          stroke: "none",
          fill: "green",
          fillOpacity: "0.5",
        };
      }
    }
  }

  async function doConvertToIppanmei(srcId: number) {
    let src = sourceList.find(src => src.id === srcId);
    if( src && src.kind === "denshi" && src.ippanmeiState?.kind === "has-ippanmei" ){
      src.薬品情報.薬品レコード.薬品コード種別 = "一般名コード";
      src.薬品情報.薬品レコード.薬品コード = src.ippanmeiState.code;
      src.薬品情報.薬品レコード.薬品名称 = src.ippanmeiState.name;
      src.ippanmeiState = { kind: "is-ippanmei" };
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div style="display:grid;grid-template-columns:200px 1fr;gap:10px;">
  <div style="font-size:14px;">
    <div>
      <DenshiMenu
        onPlus={doNew}
        on有効期限={() => changeModeTo("expire-date")}
        on備考={() => changeModeTo("bikou")}
        on提供情報={() => changeModeTo("joho")}
      />
    </div>
    {#if kouhiList.length > 0}
      <div>
        {#each kouhiList as kouhi (kouhi.kouhiId)}
          <div>
            {kouhiRep(kouhi.futansha, kouhi.memo)}
          </div>
        {/each}
      </div>
    {/if}
    {#each sourceList as source (source.id)}
      <div
        class="drug"
        class:selected={source.id === selectedSourceId}
        on:click={() => doSourceSelect(source)}
      >
        {#if source.kind === "parsed"}
          <ParsedRep parsed={source} />
        {:else if source.kind === "denshi"}
          <div style="position:relative;">
            <DenshiRep
              denshi={{
                剤形レコード: source.剤形レコード,
                用法レコード: source.用法レコード,
                用法補足レコード: source.用法補足レコード,
                薬品情報グループ: [source.薬品情報],
              }}
            />
            {#if source.ippanmeiState}
              {@const spec = ippanmeiSymbolSpec(source.ippanmeiState)}
              <div style="position:absolute;right:2px;bottom:2px">
                <a
                  href="javascript:void(0)"
                  style="position:relative;top:6px;"
                  on:click|stopPropagation={() => doConvertToIppanmei(source.id)}
                >
                  <Circle {...spec} />
                </a>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
    {#if 使用期限年月日}
      <div
        style="margin:6px 0;cursor:pointer"
        on:click={() => changeModeTo("expire-date")}
      >
        使用期限：{使用期限年月日Rep(使用期限年月日)}
      </div>
    {/if}
    {#if 備考レコード && 備考レコード.length > 0}
      <div
        style="margin:6px 0;cursor:pointer"
        on:click={() => changeModeTo("bikou")}
      >
        {#each 備考レコード ?? [] as bikou}
          <div>備考：{bikou.備考}</div>
        {/each}
      </div>
    {/if}
    {#if 提供情報レコード}
      <div>
        {#if 提供情報レコード.提供診療情報レコード}
          {#each 提供情報レコード.提供診療情報レコード as record}
            <div>
              提供診療情報:
              {#if record.薬品名称}
                【{record.薬品名称}】
              {/if}
              {record.コメント}
            </div>
          {/each}
        {/if}
        {#if 提供情報レコード.検査値データ等レコード}
          {#each 提供情報レコード.検査値データ等レコード as record}
            <div>
              検査値データ等レコード: {record.検査値データ等}
            </div>
          {/each}
        {/if}
      </div>
    {/if}
  </div>
  <div style="user-select:none;">
    {#if mode === "edit-drug" && editedSource}
      <DrugGroupForm
        {at}
        {kouhiList}
        init={editedSource}
        onEnter={onFormEnter}
        onCancel={onFormCancel}
        onDelete={doDelete}
      />
    {:else if mode === "new-drug"}
      <DrugGroupForm
        {at}
        {kouhiList}
        init={{}}
        onEnter={onNewDrug}
        onCancel={() => (mode = undefined)}
        onDelete={undefined}
      />
    {:else if mode === "expire-date"}
      <ExpireDateForm
        expireDate={使用期限年月日}
        onDone={onExpireDateDone}
        onCancel={() => (mode = undefined)}
      />
    {:else if mode === "bikou"}
      <BikouForm
        records={備考レコード ?? []}
        onDone={onBikouDone}
        onCancel={() => (mode = undefined)}
      />
    {:else if mode === "joho"}
      <JohoForm
        joho={提供情報レコード}
        onDone={onJohoDone}
        onCancel={() => (mode = undefined)}
      />
    {/if}
  </div>
</div>

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
