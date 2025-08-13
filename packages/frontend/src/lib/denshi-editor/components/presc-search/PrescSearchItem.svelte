<script lang="ts">
  import type { RP剤情報, 薬品情報 } from "@/lib/denshi-shohou/presc-info";
  import { daysTimesDisp } from "@/lib/denshi-shohou/disp/disp-util";
  import { drugRep } from "../../helper";

  export let group: RP剤情報;
  export let selectedName: string | undefined;
  export let onSelect: (value: RP剤情報) => void;
  let selected: boolean[] = [];
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
    if (selected.length === 0) {
      for (let i = 0; i < group.薬品情報グループ.length; i++) {
        selected.push(false);
      }
    }
  }

  function onDrugClick(index: number) {
    initSelected();
    if (selected === undefined) {
      throw new Error("cannot happen");
    }
    selected[index] = true;
    isEditing = true;
  }

  function doEnter() {
    const drugs: 薬品情報[] = [];
    for(let i=0;i<group.薬品情報グループ.length; i++){
      if( selected[i] ){
        drugs.push(group.薬品情報グループ[i]);
      }
    }
    if( drugs.length > 0 ){
      const value: RP剤情報 = Object.assign({}, group, {
        薬品情報グループ: drugs,
      });
      isEditing = false;
      onSelect(value);
    } else {
      alert("薬品が選択されていません。");
      return;
    }
  }
</script>

{#if isEditing}
  <div>
    <div class="drugs editing">
      {#each group.薬品情報グループ as drug, index}
        <div><input type="checkbox" bind:checked={selected[index]} /></div>
        <div>{@html rep(drug)}</div>
      {/each}
    </div>
    <div class="drugs-commands">
      <button on:click={doEnter}>追加</button>
      <button on:click={() => (isEditing = false)}>キャンセル</button>
    </div>
  </div>
{:else}
  <div class="drugs">
    {#each group.薬品情報グループ as drug, index}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div on:click={() => onDrugClick(index)}>{@html rep(drug)}</div>
    {/each}
  </div>
{/if}
<div class="usage">
  {group.用法レコード.用法名称}
  {daysTimesDisp(group)}
</div>
    <!-- <div class="item-top">
      <div class="title">{item.title}</div>
      <div>Ｒｐ）</div>
      {#each item.drugs as group, index}
        <div class="group">
          <div>{toZenkaku((index + 1).toString())}）</div>
          <div>
            <PrescSearchItemComponent {group} {selectedName} onSelect={doAdd}/>
          </div>
        </div>
      {/each}
    </div> -->

<style>
  .drugs,
  .usage {
    cursor: pointer;
  }

  .drugs.editing {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .drugs-commands {
    text-align: right;
  }
</style>
