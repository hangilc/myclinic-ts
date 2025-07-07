<script lang="ts">
  import Dialog2 from "@/lib/Dialog2.svelte";
  import type { Shohou } from "@/lib/parse-shohou";
  import {
    createConvGroupRep,
    getConvertedGroup,
    type ConvGroupRep,
  } from "./conv/conv-types";
  import ConvRep from "./conv/ConvRep.svelte";
  import ResolveDrug from "./conv/ResolveDrug.svelte";
  import type {
    PrescInfoData,
    RP剤情報,
    用法レコード,
    薬品情報,
    薬品レコード,
    薬品補足レコード,
  } from "../denshi-shohou/presc-info";
  import ResolveUsage from "./conv/ResolveUsage.svelte";
  import {
    createPrescInfo,
    create薬品レコード,
    create薬品情報,
    getConvData1,
    type ConvAux4,
    type ConvData1,
  } from "./conv/denshi-conv";

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
    let RPRP剤情報グループ: RP剤情報[] = groups.map((g) =>
      getConvertedGroup(g),
    );
    return await createPrescInfo(visitId, data1, RPRP剤情報グループ);
  }

  function doDrugSelected(group: ConvGroupRep, index: number) {
    if (clearWork) {
      return;
    }
    let drug = group.drugs[index];
    if (!workElement) {
      return;
    }
    let name: string;
    if (drug.kind === "unconverted") {
      name = drug.src.name;
    } else {
      name = drug.data.薬品レコード.薬品名称;
    }
    const d: ResolveDrug = new ResolveDrug({
      target: workElement,
      props: {
        薬品名称: name,
        分量: (drug.kind === "unconverted" 
          ? drug.data4.分量
          : drug.data.薬品レコード.分量
        ),
        単位名: (drug.kind === "unconverted"
          ? ""
          : drug.data.薬品レコード.単位名
        ),
        薬品補足レコード:
          (drug.kind === "unconverted"
            ? drug.data3.薬品補足レコード
            : drug.data.薬品補足レコード) ?? [],
        src: drug.src,
        at,
        onDone: () => clearWork && clearWork(),
        onResolved: (aux: ConvAux4, 薬品補足レコード: 薬品補足レコードIndexed[]) => {
          let converted: 薬品情報;
          if (drug.kind === "unconverted") {
            let 薬品レコード: 薬品レコード = create薬品レコード(
              drug.data4,
              aux,
            );
            converted = create薬品情報(drug.data3, 薬品レコード);
          } else {
            let 薬品レコード: 薬品レコード = Object.assign(
              {},
              drug.data.薬品レコード,
              aux,
            );
            converted = Object.assign({}, drug.data, { 薬品レコード });
          }
          converted.薬品補足レコード =
            薬品補足レコード.length > 0 ? 薬品補足レコード : undefined;
          group.drugs[index] = {
            kind: "converted",
            data: converted,
            src: drug.src,
          };
          if (aux.情報区分 === "医療材料") {
            group.data2.剤形レコード.剤形区分 = "医療材料";
          }
          groups = groups;
        },
      },
    });
    clearWork = () => {
      d.$destroy();
      clearWork = undefined;
    };
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
      const prescInfo = await getPrescInfo();
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
      <div class="conv-reps">
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
    display: grid;
    grid-template-rows: auto 1fr;
    min-height: 0;
  }

  .conv-reps {
    overflow-y: auto;
    min-height: 0;
  }

  .work {
    min-height: 0;
    overflow-y: auto;
  }

  .dialog-commands {
    margin-bottom: 10px;
  }
</style>
