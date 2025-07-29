<script lang="ts">
  import type { RP剤情報, 薬品情報 } from "@/lib/denshi-shohou/presc-info";
  import { daysTimesDisp } from "@/lib/denshi-shohou/disp/disp-util";
  import { drugRep } from "../../helper";

  export let group: RP剤情報;
  export let selectedName: string | undefined;
  let selected: boolean[] | undefined = undefined;
  let isEditing = false;

  function rep(drug: 薬品情報): string {
    let html = drugRep(drug);
    if (selectedName) {
      return html.replaceAll(
        selectedName,
        `<span style="color: red">${selectedName}</span>`,
      );
    } else {
      return html;
    }
  }

  function initSelected() {
    if( selected === undefined ){
      selected = [];
      for(let i=0;i<group.薬品情報グループ.length;i++){
        selected.push(false);
      }
    }
  }

  function onDrugClick(index: number) {
    initSelected();
    if( selected === undefined ){
      throw new Error("cannot happen");
    }
    selected[index] = true;
    isEditing = true;
  }
</script>

<div class="drugs">
  {#each group.薬品情報グループ as drug, index}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div on:click={() => onDrugClick(index)}>{@html rep(drug)}</div>
  {/each}
</div>
<div class="usage">
  {group.用法レコード.用法名称}
  {daysTimesDisp(group)}
</div>

<style>
  .drugs, .usage {
    cursor: pointer;
  }
</style>
