<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import type { Shohousen } from "@/lib/shohousen/parse-shohousen";
  import type {
    // IyakuhinMaster,
    // KizaiMaster,
    Kouhi,
  } from "myclinic-model";
  import type {
    //DrugGroupFormInitExtent,
    Init,
    Mode,
    Source,
  } from "./denshi-henkan-dialog-types";
  // import api from "@/lib/api";
  import {
    type PrescInfoData,
    type RP剤情報,
    // type 用法レコード,
    // type 薬品レコード,
    type 備考レコード,
    type 提供情報レコード,
  } from "@/lib/denshi-shohou/presc-info";
  // import {
  //   freeStyleUsageCode,
  //   type 剤形区分,
  //   type 情報区分,
  // } from "@/lib/denshi-shohou/denshi-shohou";
  // import { toHankaku } from "myclinic-rezept/zenkaku";
  // import { type DrugGroupFormInit } from "@/lib/denshi-shohou/drug-group-form-types";
  // import { tick } from "svelte";
  // import { cache } from "@/lib/cache";
  import DenshiShohouForm from "@/lib/denshi-shohou/DenshiShohouForm.svelte";

  export let destroy: () => void;
  export let init: Init;
  export let at: string;
  export let kouhiList: Kouhi[];
  export let onEnter: (data: PrescInfoData) => void;
  export let onCancel: () => void;
  export let title = "処方箋電子変換";
  let sourceIndex = 1;
  let sourceList: Source[] = [];
  // let selectedSourceId = -1;
  let mode: Mode | undefined = undefined;
  // let editedSource: (DrugGroupFormInit & DrugGroupFormInitExtent) | undefined =
  //  undefined;
  let 使用期限年月日: string | undefined = resolve使用期限年月日FromInit(init);
  let 備考レコード: 備考レコード[] | undefined =
    resolve備考レコードFromInit(init);
  let 提供情報レコード: 提供情報レコード | undefined =
    resolve提供情報レコードFromInit(init);

  sourceList = prepareSourceList(init);

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

  // function onExpireDateDone(d: string | undefined) {
  //   使用期限年月日 = d;
  //   console.log("expireDate", 使用期限年月日);
  //   mode = undefined;
  // }

  // function onBikouDone(recs: 備考レコード[]) {
  //   備考レコード = recs.length > 0 ? recs : undefined;
  //   mode = undefined;
  // }

  // function onJohoDone(rec: 提供情報レコード | undefined) {
  //   提供情報レコード = rec;
  //   mode = undefined;
  // }

  // async function onFormEnter(rp: RP剤情報) {
  //   if (
  //     editedSource &&
  //     editedSource.用法レコード &&
  //     editedSource.用法レコード.用法コード === freeStyleUsageCode
  //   ) {
  //     if (rp.用法レコード.用法コード !== freeStyleUsageCode) {
  //       const u = editedSource.用法レコード.用法名称;
  //       const map = await cache.getUsageMasterMap();
  //       map[u] = Object.assign({}, rp.用法レコード);
  //       await cache.setUsageMasterMap(map);
  //     }
  //   }
  //   {
  //     const rec: 薬品レコード | undefined =
  //       rp.薬品情報グループ[0]?.薬品レコード;
  //     if (rec === undefined) {
  //       throw new Error("empty RP剤情報");
  //     }
  //     if (editedSource?.sourceDrugName) {
  //       const drugName = editedSource.sourceDrugName;
  //       if (rec.薬品コード種別 === "レセプト電算処理システム用コード") {
  //         const map = await cache.getDrugNameIyakuhincodeMap();
  //         const bind = map[drugName];
  //         if (!bind || bind.toString() !== rec.薬品コード) {
  //           const newMap = { ...map };
  //           newMap[drugName] = parseInt(rec.薬品コード);
  //           await cache.setDrugNameIyakuhincodeMap(newMap);
  //           console.log("newMap", newMap);
  //         }
  //       }
  //     }
  //   }
  //   sourceList = sourceList.map((src) => {
  //     if (src.id === selectedSourceId) {
  //       return rpToSource(rp);
  //     } else {
  //       return src;
  //     }
  //   });
  //   await reset();
  // }

  // async function onNewDrug(rp: RP剤情報) {
  //   sourceList.push(rpToSource(rp));
  //   sourceList = sourceList;
  //   await reset();
  // }

  // function rpToSource(rp: RP剤情報): Source {
  //   return {
  //     kind: "denshi",
  //     剤形レコード: rp.剤形レコード,
  //     用法レコード: rp.用法レコード,
  //     用法補足レコード: rp.用法補足レコード,
  //     薬品情報: rp.薬品情報グループ[0],
  //     id: sourceIndex++,
  //   };
  // }

  // async function reset() {
  //   mode = undefined;
  //   editedSource = undefined;
  //   selectedSourceId = -1;
  //   await tick();
  // }

  // async function onFormCancel() {
  //   await reset();
  // }

  function isAllConverted(list: Source[]): boolean {
    for (let src of list) {
      if (src.kind !== "denshi") {
        return false;
      }
    }
    return true;
  }

  function doEnter() {
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
	  console.log("limit", 使用期限年月日);
      destroy();
      onEnter(data);
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
    return data.RP剤情報グループ.map((g) => {
      if (g.薬品情報グループ.length !== 1) {
        throw new Error("invalid number of drug groups");
      }
      return {
        kind: "denshi",
        剤形レコード: g.剤形レコード,
        用法レコード: g.用法レコード,
        用法補足レコード: g.用法補足レコード,
        薬品情報: g.薬品情報グループ[0],
        id: sourceIndex++,
      };
    });
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

  // function resolveParsed剤形区分(
  //   times: string | undefined
  // ): 剤形区分 | undefined {
  //   if (times) {
  //     if (times.indexOf("日分") > 0) {
  //       return "内服";
  //     } else if (times.indexOf("回分") > 0) {
  //       return "頓服";
  //     } else {
  //       return "外用";
  //     }
  //   } else {
  //     return "外用";
  //   }
  // }

  // function resolveParsed調剤数量(
  //   times: string | undefined
  // ): number | undefined {
  //   if (times) {
  //     let m = /([0-9０-９]+)(日|回)分$/.exec(times);
  //     if (m) {
  //       return parseInt(toHankaku(m[1]));
  //     }
  //   } else {
  //     return undefined;
  //   }
  // }

  // async function resolveParsed用法レコード(
  //   usage: string
  // ): Promise<用法レコード | undefined> {
  //   const map = await cache.getUsageMasterMap();
  //   const rec = map[usage];
  //   if (rec) {
  //     return rec;
  //   } else {
  //     return {
  //       用法コード: freeStyleUsageCode,
  //       用法名称: usage,
  //     };
  //   }
  // }

  // function resolveParsedAmount(amount: string): number | undefined {
  //   const a = parseFloat(toHankaku(amount));
  //   return isNaN(a) ? undefined : a;
  // }

  // async function probeIyakuhincode(name: string): Promise<number | undefined> {
  //   const map = await cache.getDrugNameIyakuhincodeMap();
  //   return map[name] ?? undefined;
  // }

  // async function resolveParsedIyakuhin(
  //   name: string,
  //   amount: string
  // ): Promise<
  //   | { 薬品レコード: 薬品レコード }
  //   | { iyakuhinSearchText: string; amount: number | undefined }
  // > {
  //   const amountValue = resolveParsedAmount(amount);
  //   const bind = await probeIyakuhincode(name);
  //   if (bind) {
  //     let master: IyakuhinMaster | KizaiMaster | undefined = undefined;
  //     let 情報区分: 情報区分 = "医薬品";
  //     const code = bind.toString();
  //     if (code.startsWith("6")) {
  //       master = await api.getIyakuhinMaster(bind, at);
  //     } else if (code.startsWith("7")) {
  //       master = await api.getKizaiMaster(bind, at);
  //       情報区分 = "医療材料";
  //     }
  //     if (master) {
  //       if (amountValue !== undefined) {
  //         return {
  //           薬品レコード: {
  //             情報区分,
  //             薬品コード種別: "レセプト電算処理システム用コード",
  //             薬品コード: code,
  //             薬品名称: master.name,
  //             分量: amount,
  //             力価フラグ: "薬価単位",
  //             単位名: master.unit,
  //           },
  //         };
  //       }
  //     }
  //   }
  //   return {
  //     iyakuhinSearchText: name,
  //     amount: amountValue,
  //   };
  // }

  // async function sourceToInit(
  //   src: Source
  // ): Promise<DrugGroupFormInit & DrugGroupFormInitExtent> {
  //   switch (src.kind) {
  //     case "parsed": {
  //       const amount = resolveParsedAmount(src.amount);
  //       const resolved = await resolveParsedIyakuhin(
  //         src.name,
  //         amount?.toString() ?? ""
  //       );
  //       let 剤形区分: 剤形区分 | undefined = resolveParsed剤形区分(src.times);
  //       if ("薬品レコード" in resolved) {
  //         const code = resolved.薬品レコード.薬品コード;
  //         if (code.startsWith("7")) {
  //           剤形区分 = "医療材料";
  //           if (
  //             resolved.薬品レコード.薬品名称.startsWith(
  //               "万年筆型注入器用注射針"
  //             )
  //           ) {
  //             resolved.薬品レコード.単位名 = "本";
  //           }
  //         } else {
  //           const name = resolved.薬品レコード.薬品名称;
  //           if (
  //             name.startsWith("ランタス注ソロスター") ||
  //             name.startsWith("アピドラ注ソロスター")
  //           ) {
  //             剤形区分 = "注射";
  //           }
  //         }
  //       }
  //       return {
  //         剤形区分,
  //         調剤数量: resolveParsed調剤数量(src.times),
  //         用法レコード: await resolveParsed用法レコード(src.usage),
  //         ...resolved,
  //         sourceDrugName: src.name,
  //       };
  //     }
  //     case "denshi": {
  //       return {
  //         剤形区分: src.剤形レコード.剤形区分,
  //         調剤数量: src.剤形レコード.調剤数量,
  //         用法レコード: src.用法レコード,
  //         用法補足レコード: src.用法補足レコード,
  //         薬品レコード: src.薬品情報.薬品レコード,
  //         不均等レコード: src.薬品情報.不均等レコード,
  //         負担区分レコード: src.薬品情報.負担区分レコード,
  //         薬品補足レコード: src.薬品情報.薬品補足レコード,
  //       };
  //     }
  //     default: {
  //       return {};
  //     }
  //   }
  // }

  // async function doSourceSelect(src: Source) {
  //   editedSource = await sourceToInit(src);
  //   selectedSourceId = src.id;
  //   mode = undefined;
  //   await tick();
  //   mode = "edit-drug";
  // }

  // async function doNew() {
  //   await reset();
  //   mode = "new-drug";
  // }

  // async function changeModeTo(m: Mode) {
  //   await reset();
  //   mode = m;
  // }

  // async function doSearchUsage() {
  //   const t = usageSearchText.trim();
  //   if (t !== "") {
  //     usageSearchResult = await api.selectUsageMasterByUsageName(t);
  //   }
  // }

  // function doUsageMasterSelect(m: UsageMaster) {
  //   targetUsage = {
  //     kind: "master",
  //     master: m,
  //   };
  //   console.log("usageMaster", m);
  //   usageSearchText = "";
  //   usageSearchResult = [];
  // }

  function doCancel() {
    destroy();
    onCancel();
  }

  // function targetUsageRep(target: TargetUsage | undefined): string {
  //   if (target) {
  //     switch (target.kind) {
  //       case "master": {
  //         return target.master.usage_name;
  //       }
  //       case "free-style": {
  //         return target.text;
  //       }
  //       default: {
  //         throw new Error("cannot happen (targetUsageRep)");
  //       }
  //     }
  //   } else {
  //     return "";
  //   }
  // }

  // async function trySetTargetUsage(src: string) {
  //   targetUsage = undefined;
  //   let t = "";
  //   switch (src) {
  //     case "分１　寝る前": {
  //       t = "１日１回就寝前　服用";
  //       break;
  //     }
  //   }
  //   if (t !== "") {
  //     const r = await api.selectUsageMasterByUsageName(t);
  //     if (r.length === 1) {
  //       targetUsage = { kind: "master", master: r[0] };
  //     }
  //   }
  // }

  // function doDelete() {
  //   sourceList = sourceList.filter((s) => s.id !== selectedSourceId);
  //   reset();
  // }

  
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<Dialog {title} destroy={doCancel} styleWidth="600px">
  <DenshiShohouForm
    {init}
    {at}
    {kouhiList}
    bind:sourceList
	bind:使用期限年月日
	bind:備考レコード
	bind:提供情報レコード
  />
  <div style="text-align:right;">
    <button
      on:click={doEnter}
      disabled={!isAllConverted(sourceList) || mode != undefined}>入力</button
    >
    <button on:click={doCancel}>キャンセル</button>
  </div>
</Dialog>

