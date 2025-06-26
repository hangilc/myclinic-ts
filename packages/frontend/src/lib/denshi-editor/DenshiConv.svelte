<script lang="ts">
  import type { IyakuhinMaster } from "myclinic-model";
  import Dialog2 from "../Dialog2.svelte";
  import type { DrugGroup, Shohou } from "../parse-shohou";
  import { toHankaku } from "../zenkaku";
  import { createConvGroupRep, type ConvGroupRep } from "./conv/conv-types";
  import ConvRep from "./conv/ConvRep.svelte";
  import ResolveDrug from "./conv/ResolveDrug.svelte";
  import type {
    PrescInfoData,
    RP剤情報,
    用法レコード,
    薬品情報,
  } from "../denshi-shohou/presc-info";
  import type { 剤形区分 } from "../denshi-shohou/denshi-shohou";
  import ResolveUsage from "./conv/ResolveUsage.svelte";

  export let destroy: () => void;
  export let shohou: Shohou;
  export let at: string;
  export let visitId: number;
  export let onEnter: (prescInfo: PrescInfoData) => void;

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

  function allConverted(gs: ConvGroupRep[]): boolean {
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

  function convertedData(): {
    薬品情報グループ: 薬品情報[];
    用法レコード: 用法レコード;
  }[] {
    const result: {
      薬品情報グループ: 薬品情報[];
      用法レコード: 用法レコード;
    }[] = [];
    for (let g of groups) {
      if (g.usage.kind !== "converted") {
        throw new Error("not converted usage");
      }
      let 用法レコード = g.usage.data;
      let 薬品情報グループ: 薬品情報[] = [];
      for (let d of g.drugs) {
        if (d.kind !== "converted") {
          throw new Error("not converted drug");
        }
        薬品情報グループ.push(d.data);
      }
      result.push({ 薬品情報グループ, 用法レコード });
    }
    return result;
  }

  function 剤形区分ofShohou(group: DrugGroup): 剤形区分 {
    // Most frequent case
    if (group.usage.kind === "days") {
      return "内服";
    }

    // Check usage pattern first
    if (group.usage.kind === "times") {
      // Times-based usage typically indicates 頓服 (as needed)
      return "頓服";
    }

    // Check drug names and units for external use indicators
    for (const drug of group.drugs) {
      const name = drug.name.toLowerCase();
      const unit = drug.unit.toLowerCase();

      // External use (外用) indicators
      if (
        name.includes("軟膏") ||
        name.includes("クリーム") ||
        name.includes("ローション") ||
        name.includes("湿布") ||
        name.includes("シール") ||
        name.includes("貼付") ||
        name.includes("点眼") ||
        name.includes("点鼻") ||
        name.includes("吸入") ||
        name.includes("うがい") ||
        name.includes("外用") ||
        name.includes("塗布") ||
        unit.includes("g") ||
        (unit.includes("ml") &&
          (name.includes("点眼") || name.includes("点鼻")))
      ) {
        return "外用";
      }

      // Injectable (注射) indicators
      if (
        name.includes("注射") ||
        name.includes("注入") ||
        name.includes("静注") ||
        name.includes("筋注") ||
        name.includes("皮下注") ||
        unit.includes("バイアル") ||
        unit.includes("アンプル")
      ) {
        return "注射";
      }

      // Liquid internal use (内服滴剤) indicators
      if (
        (name.includes("内服液") ||
          name.includes("シロップ") ||
          name.includes("滴剤")) &&
        unit.includes("ml")
      ) {
        return "内服滴剤";
      }

      // Medical materials (医療材料) indicators
      // if (name.includes("材料") || name.includes("器具") || name.includes("用品") || name.includes("注射針") ||
      //     unit.includes("セット") || unit.includes("キット")) {
      //   return "医療材料";
      // }
    }

    // Fallback to unknown
    return "不明";
  }

  function 調剤数量ofShohou(group: DrugGroup): number {
    const usage = group.usage;
    
    // For days-based prescriptions, return the number of days
    if (usage.kind === "days") {
      const days = parseInt(toHankaku(usage.days));
      if (isNaN(days)) {
        throw new Error(`Invalid days value: ${usage.days}`);
      }
      return days;
    }
    
    // For times-based prescriptions (頓服), return the number of times
    if (usage.kind === "times") {
      const times = parseInt(toHankaku(usage.times));
      if (isNaN(times)) {
        throw new Error(`Invalid times value: ${usage.times}`);
      }
      return times;
    }

    return 1;
  }

  async function createDenshi(
    visitId: number,
    shohou: Shohou,
    converted: {
      薬品情報グループ: 薬品情報[];
      用法レコード: 用法レコード;
    }[],
  ): Promise<PrescInfoData> {
    const { initPrescInfoDataFromVisitId } = await import(
      "../denshi-shohou/visit-shohou"
    );
    const prescInfoData = await initPrescInfoDataFromVisitId(visitId);

    const RP剤情報グループ: RP剤情報[] = converted.map((group, index) => {
      return {
        剤形レコード: {
          剤形区分: 剤形区分ofShohou(shohou.groups[index]),
          調剤数量: 調剤数量ofShohou(shohou.groups[index]),
        },
        用法レコード: group.用法レコード,
        薬品情報グループ: group.薬品情報グループ,
      };
    });

    prescInfoData.RP剤情報グループ = RP剤情報グループ;
    prescInfoData.処方箋交付年月日 = at.replaceAll(/-/g, "");

    return prescInfoData;
  }

  function doDrugSelected(group: ConvGroupRep, index: number) {
    if (clearWork) {
      return;
    }
    let drug = group.drugs[index];
    if (drug.kind === "resolver") {
      const d: ResolveDrug = new ResolveDrug({
        target: workElement,
        props: {
          name: drug.src.name,
          at,
          onDone: () => clearWork && clearWork(),
          onResolved: (m: IyakuhinMaster) => {
            let converted: 薬品情報 = {
              薬品レコード: {
                情報区分: "医薬品",
                薬品コード種別: "レセプト電算処理システム用コード",
                薬品コード: m.iyakuhincode.toString(),
                薬品名称: m.name,
                分量: drug.src.amount,
                力価フラグ: "薬価単位",
                単位名: m.unit,
              },
            };
            group.drugs[index] = {
              kind: "converted",
              data: drug.resolver(m),
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
        {#if allConverted(groups)}
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
