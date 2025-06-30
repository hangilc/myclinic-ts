<script lang="ts">
  import Dialog2 from "@/lib/Dialog2.svelte";
  import type { DrugGroup, Shohou, Drug } from "@/lib/parse-shohou";
  import { toHankaku } from "@/lib/zenkaku";
  import { createConvGroupRep, getConvertedGroup, type ConvGroupRep } from "./conv/conv-types";
  import ConvRep from "./conv/ConvRep.svelte";
  import ResolveDrug from "./conv/ResolveDrug.svelte";
  import type {
    PrescInfoData,
    RP剤情報,
    用法レコード,
    薬品情報,
    不均等レコード,
    薬品補足レコード,
    備考レコード,
  } from "../denshi-shohou/presc-info";
  import type { 剤形区分 } from "../denshi-shohou/denshi-shohou";
  import ResolveUsage from "./conv/ResolveUsage.svelte";
  import { DateWrapper } from "myclinic-util";
  import { convDrugToDenshi, type 薬品レコードPartial2 } from "./conv/denshi-conv-helper";
  import { createPrescInfo, getConvData1, type ConvData1 } from "./conv/denshi-conv";

  export let destroy: () => void;
  export let shohou: Shohou;
  export let at: string;
  export let visitId: number;
  export let onEnter: (prescInfo: PrescInfoData) => void;

  let data1: ConvData1 = getConvData1(shohou);
  let groups: ConvGroupRep[] = [];
  let workElement: HTMLElement;
  let clearWork: (() => void) | undefined = undefined;

  initGroups();

  async function initGroups() {
    let gs: ConvGroupRep[] = [];
    for (let g of shohou.groups) {
      let group = await createConvGroupRep(g, at);
      gs.push(group);
    }
    groups = gs;
  }


  function isAllConverted(gs: ConvGroupRep[]): boolean {
    for (let g of gs) {
      if (g.usage.kind !== "converted") {
        return false;
      }
      for (let d of g.drugs) {
        if (d.kind !== "converted") {
          return false;
        }
      }
    }
    return true;
  }

  async function getPrescInfo(): Promise<PrescInfoData> {
    let RPRP剤情報グループ: RP剤情報[] = groups.map(g => getConvertedGroup(g));
    return await createPrescInfo(visitId, data1, RPRP剤情報グループ);
  }

  // function convertedData(): {
  //   薬品情報グループ: 薬品情報[];
  //   用法レコード: 用法レコード;
  // }[] {
  //   const result: {
  //     薬品情報グループ: 薬品情報[];
  //     用法レコード: 用法レコード;
  //   }[] = [];
  //   for (let g of groups) {
  //     if (g.usage.kind !== "converted") {
  //       throw new Error("not converted usage");
  //     }
  //     let 用法レコード = g.usage.data;
  //     let 薬品情報グループ: 薬品情報[] = [];
  //     for (let d of g.drugs) {
  //       if (d.kind !== "converted") {
  //         throw new Error("not converted drug");
  //       }
  //       薬品情報グループ.push(d.data);
  //     }
  //     result.push({ 薬品情報グループ, 用法レコード });
  //   }
  //   return result;
  // }

  // function 剤形区分ofShohou(group: DrugGroup): 剤形区分 {
  //   // Most frequent case
  //   if (group.usage.kind === "days") {
  //     return "内服";
  //   }

  //   // Check usage pattern first
  //   if (group.usage.kind === "times") {
  //     // Times-based usage typically indicates 頓服 (as needed)
  //     return "頓服";
  //   }

  //   // Check drug names and units for external use indicators
  //   for (const drug of group.drugs) {
  //     const name = drug.name.toLowerCase();
  //     const unit = drug.unit.toLowerCase();

  //     // External use (外用) indicators
  //     if (
  //       name.includes("軟膏") ||
  //       name.includes("クリーム") ||
  //       name.includes("ローション") ||
  //       name.includes("湿布") ||
  //       name.includes("シール") ||
  //       name.includes("貼付") ||
  //       name.includes("点眼") ||
  //       name.includes("点鼻") ||
  //       name.includes("吸入") ||
  //       name.includes("うがい") ||
  //       name.includes("外用") ||
  //       name.includes("塗布") ||
  //       unit.includes("g") ||
  //       (unit.includes("ml") &&
  //         (name.includes("点眼") || name.includes("点鼻")))
  //     ) {
  //       return "外用";
  //     }

  //     // Injectable (注射) indicators
  //     if (
  //       name.includes("注射") ||
  //       name.includes("注入") ||
  //       name.includes("静注") ||
  //       name.includes("筋注") ||
  //       name.includes("皮下注") ||
  //       unit.includes("バイアル") ||
  //       unit.includes("アンプル")
  //     ) {
  //       return "注射";
  //     }

  //     // Liquid internal use (内服滴剤) indicators
  //     if (
  //       (name.includes("内服液") ||
  //         name.includes("シロップ") ||
  //         name.includes("滴剤")) &&
  //       unit.includes("ml")
  //     ) {
  //       return "内服滴剤";
  //     }
  //   }

  //   // Fallback to unknown
  //   return "不明";
  // }

  // function 調剤数量ofShohou(group: DrugGroup): number {
  //   const usage = group.usage;

  //   // For days-based prescriptions, return the number of days
  //   if (usage.kind === "days") {
  //     const days = parseInt(toHankaku(usage.days));
  //     if (isNaN(days)) {
  //       throw new Error(`Invalid days value: ${usage.days}`);
  //     }
  //     return days;
  //   }

  //   // For times-based prescriptions (頓服), return the number of times
  //   if (usage.kind === "times") {
  //     const times = parseInt(toHankaku(usage.times));
  //     if (isNaN(times)) {
  //       throw new Error(`Invalid times value: ${usage.times}`);
  //     }
  //     return times;
  //   }

  //   return 1;
  // }

  // function handleDrugUneven(joho: 薬品情報, drug: Drug) {
  //   if (drug.uneven) {
  //     let uneven = drug.uneven;
  //     uneven = uneven.replace(/^\s*[(（]/, "");
  //     uneven = uneven.replace(/[)）]\s*$/, "");
  //     let sep = /\s*[-ー－]\s*/;
  //     const unevenParts = uneven.split(sep);
  //     if (unevenParts.length >= 2) {
  //       const 不均等レコード: 不均等レコード = {
  //         不均等１回目服用量: toHankaku(unevenParts[0]),
  //         不均等２回目服用量: toHankaku(unevenParts[1]),
  //         不均等３回目服用量: unevenParts[2]
  //           ? toHankaku(unevenParts[2].trim())
  //           : undefined,
  //         不均等４回目服用量: unevenParts[3]
  //           ? toHankaku(unevenParts[3].trim())
  //           : undefined,
  //         不均等５回目服用量: unevenParts[4]
  //           ? toHankaku(unevenParts[4].trim())
  //           : undefined,
  //       };
  //       joho.不均等レコード = 不均等レコード;
  //     } else throw new Error("uneven record has less than two parts.");
  //   }
  // }

  // function handleDrugSenpatsu(joho: 薬品情報, drug: Drug) {
  //   if (drug.senpatsu) {
  //     if (!joho.薬品補足レコード) {
  //       joho.薬品補足レコード = [];
  //     }

  //     let 薬品補足情報: string;
  //     switch (drug.senpatsu) {
  //       case "henkoufuka":
  //         薬品補足情報 = "後発品変更不可";
  //         break;
  //       case "kanjakibou":
  //         薬品補足情報 = "先発医薬品患者希望";
  //         break;
  //       default:
  //         throw new Error(`Unknown senpatsu type: ${drug.senpatsu}`);
  //     }

  //     const 薬品補足レコード: 薬品補足レコード = {
  //       薬品補足情報,
  //     };

  //     joho.薬品補足レコード.push(薬品補足レコード);
  //   }
  // }

  // function handleDrugComments(joho: 薬品情報, drug: Drug) {
  //   if (drug.drugComments && drug.drugComments.length > 0) {
  //     if (!joho.薬品補足レコード) {
  //       joho.薬品補足レコード = [];
  //     }

  //     for (const comment of drug.drugComments) {
  //       const 薬品補足レコード: 薬品補足レコード = {
  //         薬品補足情報: comment,
  //       };
  //       joho.薬品補足レコード.push(薬品補足レコード);
  //     }
  //   }
  // }

  // function createDenshiDrug(joho: 薬品情報, drug: Drug): 薬品情報 {
  //   const result = { ...joho };
  //   handleDrugUneven(result, drug);
  //   handleDrugSenpatsu(result, drug);
  //   handleDrugComments(result, drug);
  //   return result;
  // }

  // function handleDenshiGroup(denshi: RP剤情報, group: DrugGroup) {
  //   if (!denshi.用法補足レコード) {
  //     denshi.用法補足レコード = [];
  //   }
  //   for (let c of group.groupComments) {
  //     denshi.用法補足レコード.push({
  //       用法補足情報: c,
  //     });
  //   }
  // }

  // function handleBikou(data: PrescInfoData, shohou: Shohou) {
  //   let bs: 備考レコード[] = [];
  //   for (let b of shohou.bikou) {
  //     if (b === "高７" || b === "高８" || b === "高９") {
  //       continue;
  //     }
  //     bs.push({ 備考: b });
  //   }
  //   if (bs.length > 0) {
  //     if (!data.備考レコード) {
  //       data.備考レコード = [];
  //     }
  //     data.備考レコード.push(...bs);
  //   }
  // }

  // function handleKigen(data: PrescInfoData, shohou: Shohou) {
  //   if (shohou.kigen) {
  //     data.使用期限年月日 = DateWrapper.from(shohou.kigen)
  //       .asSqlDate()
  //       .replaceAll(/-/g, "");
  //   }
  // }

  // function handleShohouComments(data: PrescInfoData, shohou: Shohou) {
  //   if( shohou.comments ){
  //     for(let c of shohou.comments) {
  //       if( c === "一包化" ){
  //         if( !data.備考レコード ) {
  //           data.備考レコード = [];
  //         }
  //         data.備考レコード.push({
  //           備考: "一包化",
  //         })
  //       } else {
  //         if( !data.提供情報レコード ) {
  //           data.提供情報レコード = {
  //             "提供診療情報レコード": []
  //           }
  //         }
  //         if( !data.提供情報レコード["提供診療情報レコード"] ) {
  //           data.提供情報レコード["提供診療情報レコード"] = [];
  //         }
  //         data.提供情報レコード.提供診療情報レコード.push({
  //           コメント: c
  //         })
  //       }
  //     }
  //   }
  // }

  // async function createDenshi(
  //   visitId: number,
  //   shohou: Shohou,
  //   converted: {
  //     薬品情報グループ: 薬品情報[];
  //     用法レコード: 用法レコード;
  //   }[],
  // ): Promise<PrescInfoData> {
  //   const { initPrescInfoDataFromVisitId } = await import(
  //     "../denshi-shohou/visit-shohou"
  //   );
  //   const prescInfoData = await initPrescInfoDataFromVisitId(visitId);

  //   const RP剤情報グループ: RP剤情報[] = converted.map((group, index) => {
  //     const originalGroup = shohou.groups[index];
  //     const processedDrugs = group.薬品情報グループ.map(
  //       (drugInfo, drugIndex) => {
  //         const originalDrug = originalGroup.drugs[drugIndex];
  //         return createDenshiDrug(drugInfo, originalDrug);
  //       },
  //     );
  //     let denshiGroup: RP剤情報 = {
  //       剤形レコード: {
  //         剤形区分: 剤形区分ofShohou(originalGroup),
  //         調剤数量: 調剤数量ofShohou(originalGroup),
  //       },
  //       用法レコード: group.用法レコード,
  //       薬品情報グループ: processedDrugs,
  //     };
  //     handleDenshiGroup(denshiGroup, originalGroup);
  //     return denshiGroup;
  //   });

  //   prescInfoData.RP剤情報グループ = RP剤情報グループ;
  //   handleBikou(prescInfoData, shohou);
  //   handleKigen(prescInfoData, shohou);
  //   handleShohouComments(prescInfoData, shohou);
  //   return prescInfoData;
  // }

  function doDrugSelected(group: ConvGroupRep, index: number) {
    if (clearWork) {
      return;
    }
    let drug = group.drugs[index];
    if (drug.kind === "unconverted" && workElement ) {
      const d: ResolveDrug = new ResolveDrug({
        target: workElement,
        props: {
          name: drug.src.name,
          at,
          onDone: () => clearWork && clearWork(),
          onResolved: (info: 薬品レコードPartial2) => {
            let converted: 薬品情報 = convDrugToDenshi(drug.薬品情報Partial1, drug.薬品レコードpartial1, info);
            group.drugs[index] = {
              kind: "converted",
              data: converted,
            };
            groups = groups;
          },
        },
      });
      clearWork = () => {
        d.$destroy();
        clearWork = undefined;
      };
    }
  }

  function doUsageSelected(group: ConvGroupRep, name: string) {
    if (clearWork) {
      return;
    }
    const e: ResolveUsage = new ResolveUsage({
      target: workElement,
      props: {
        name,
        onDone: () => clearWork && clearWork(),
        onResolved: (rec: 用法レコード) => {
          group.usage = {
            kind: "converted",
            data: rec,
          };
          groups = groups;
        },
      },
    });
    clearWork = () => {
      e.$destroy();
      clearWork = undefined;
    };
  }

  async function doEnter() {
    try {
      const converted = convertedData();
      const prescInfo = await createDenshi(visitId, shohou, converted);
      destroy();
      onEnter(prescInfo);
    } catch (error) {
      console.error("Error creating denshi:", error);
      alert("電子処方箋の作成に失敗しました");
    }
  }

  function doCancel() {
    destroy();
  }
</script>

<Dialog2 title="処方箋電子変換" {destroy}>
  <div class="denshi-editor wrapper">
    <div class="left">
      <div class="dialog-commands">
        {#if isAllConverted(groups)}
          <button on:click={doEnter}>入力</button>
        {/if}
        <button on:click={doCancel}>キャンセル</button>
      </div>
      <div>
        <ConvRep
          bind:groups
          onDrugSelected={doDrugSelected}
          onUsageSelected={doUsageSelected}
        />
      </div>
    </div>
    <div class="work" bind:this={workElement}></div>
  </div>
</Dialog2>

<style>
  .wrapper {
    width: 800px;
    height: 600px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 10px;
    padding: 10px;
  }

  .left {
    border-right: 1px solid gray;
  }

  .work {
    height: auto;
    max-height: 100%;
  }

  .dialog-commands {
    margin-bottom: 10px;
  }
</style>
