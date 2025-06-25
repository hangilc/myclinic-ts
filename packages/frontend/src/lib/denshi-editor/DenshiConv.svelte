<script lang="ts">
  import type { IyakuhinMaster } from "myclinic-model";
  import Dialog2 from "../Dialog2.svelte";
  import type { Shohou } from "../parse-shohou";
  import { createConvGroupRep, type ConvGroupRep } from "./conv/conv-types";
  import ConvRep from "./conv/ConvRep.svelte";
  import ResolveDrug from "./conv/ResolveDrug.svelte";
  import type { 薬品情報 } from "../denshi-shohou/presc-info";

  export let destroy: () => void;
  export let shohou: Shohou;
  export let at: string;
  let groups: ConvGroupRep[] = [];
  let workElement: HTMLElement;

  let clearWork: (() => void) | undefined = undefined;

  initGroups();

  async function initGroups() {
    let gs: ConvGroupRep[] = [];
    for(let g of shohou.groups) {
      let group = await createConvGroupRep(g, at);
      gs.push(group);
    }
    groups = gs;
  }

  function doDrugSelected(group: ConvGroupRep, index: number) {
    if( clearWork ){
      return;
    }
    let drug = group.drugs[index];
    if( drug.kind === "resolver" ){
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
              }
            };
            group.drugs[index] = {
              kind: "converted",
              data: drug.resolver(m),
            }
            groups = groups;
          },
        }
      });
      clearWork = () => {
        d.$destroy();
        clearWork = undefined;
      }
    }
  }
</script>

<Dialog2 title="処方箋電子変換" {destroy}>
  <div class="denshi-editor wrapper">
    <div class="left">
      <ConvRep bind:groups onDrugSelected={doDrugSelected}/>
    </div>
    <div class="work" bind:this={workElement}>

    </div>
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
</style>