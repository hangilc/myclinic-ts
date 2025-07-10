<script lang="ts">
  import type { PrescInfoData } from "../denshi-shohou/presc-info";
  import Dialog2 from "../Dialog2.svelte";
  import Commands from "./components/Commands.svelte";
  import CurrentPresc from "./components/CurrentPresc.svelte";
  import {
    PrescInfoWrapper,
    RP剤情報Wrapper,
    薬品情報Wrapper,
  } from "./denshi-tmpl";
  import EditDrug from "./components/EditDrug.svelte";

  export let title: string;
  export let destroy: () => void;
  export let orig: PrescInfoData;
  export let at: string;
  export let showValid: boolean = false;
  
  let data = new PrescInfoWrapper(orig);
  let clearWorkarea: (() => void) | undefined = undefined;
  let wa: HTMLElement;

  function doCancel() {
    destroy();
  }

  function onDrugSelect(group: RP剤情報Wrapper, drug: 薬品情報Wrapper) {
    if( !wa ){ return; }
    if (clearWorkarea) {
      alert("現在編集中です。」");
      return;
    }
    let w: EditDrug = new EditDrug({
      target: wa,
      props: {
        destroy: () => (clearWorkarea && clearWorkarea()),
        group,
        drugId: drug.id,
        at,
        onChange: () => data = data,
      }
    });
    clearWorkarea =  () => {
      w.$destroy();
      clearWorkarea = undefined;
    }
  }
</script>

<Dialog2 {title} {destroy}>
  <div class="top">
    <div class="left">
      <Commands onCancel={doCancel} />
      <CurrentPresc {data} {onDrugSelect} {showValid} />
    </div>
    <div class="workarea" bind:this={wa}></div>
  </div>
</Dialog2>

<style>
  .top {
    margin: 0 10px 10px 10px;
    width: 760px;
    height: 600px;
    display: grid;
    grid-template-columns: 50% 1fr;
    gap: 10px;
    padding: 0 10px 10px 10px;
    overflow-y: auto;
  }

  .left {
  }
</style>
