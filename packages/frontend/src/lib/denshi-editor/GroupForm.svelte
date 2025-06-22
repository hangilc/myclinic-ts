<script lang="ts">
  import {
    index用法補足レコード,
    unindex用法補足レコード,
    type 用法補足レコードIndexed,
    type 薬品情報Indexed,
  } from "./denshi-editor-types";
  import DrugDays from "./DrugDays.svelte";
  import DrugUsage from "./DrugUsage.svelte";
  import type {
    剤形区分,
    用法補足区分,
  } from "@/lib/denshi-shohou/denshi-shohou";
  import { drugRep } from "./helper";
  import CogLink from "./icons/CogLink.svelte";
  import YouhouHosoku from "./drug-form/YouhouHosoku.svelte";
  import type { 用法補足レコード } from "../denshi-shohou/presc-info";
  import Link from "./widgets/Link.svelte";

  export let onDone: () => void;
  export let onDeleteDrugs: (drugIds: number[]) => void;
  export let 用法コード: string;
  export let 用法名称: string;
  export let 調剤数量: number;
  export let 剤形区分: 剤形区分;
  export let drugs: 薬品情報Indexed[];
  export let 用法補足レコード: 用法補足レコードIndexed[];
  export let onChange: (date: {
    用法コード: string;
    用法名称: string;
    調剤数量: number;
    用法補足レコード: 用法補足レコードIndexed[];
  }) => void;

  let isEditing用法コード: boolean = false;
  let isEditing調剤数量: boolean = false;
  let showAuxMenu = false;
  let selectedDrugs: Record<number, boolean> = {};

  function isEditing用法補足レコード(): boolean {
    return 用法補足レコード.some((r) => r.isEditing);
  }

  function confirmNotEditing(): boolean {
    if (isEditing用法コード) {
      alert("用法が編集中です。");
      return false;
    }
    if (isEditing調剤数量) {
      alert("日数・回数が編集中です。");
      return false;
    }
    if (isEditing用法補足レコード()) {
      alert("用法補足が編集中です。");
      return false;
    }
    return true;
  }

  function doEnter() {
    if (!confirmNotEditing()) {
      return;
    }
    onDone();
    onChange({ 用法コード, 用法名称, 調剤数量, 用法補足レコード });
  }

  function doDelete() {
    const drugIds: number[] = [];
    for(let key in selectedDrugs){
      if( selectedDrugs[key] ){
        drugIds.push(parseInt(key));
      }
    }
    console.log("drugIds", drugIds);
    if (drugIds.length > 0 && ("この薬剤グループを削除しますか？")) {
      onDone();
      onDeleteDrugs(drugIds);
    }
  }

  function toggleAuxMenu() {
    showAuxMenu = !showAuxMenu;
  }

  function doAddYouhouHosoku(kubun: 用法補足区分) {
    if (kubun === "一包化") {
      let h: 用法補足レコード = {
        用法補足区分: kubun,
        用法補足情報: kubun,
      };
      用法補足レコード.push(index用法補足レコード(h));
      用法補足レコード = 用法補足レコード;
    } else {
      let h: 用法補足レコード = {
        用法補足区分: kubun,
        用法補足情報: "",
      };
      用法補足レコード.push(index用法補足レコード(h));
      用法補足レコード = 用法補足レコード;
    }
    showAuxMenu = false;
  }

  function youhouHosokuNotContains(
    list: 用法補足レコードIndexed[],
    kubun: 用法補足区分,
  ): boolean {
    for (let r of list) {
      if (r.用法補足区分 === kubun) {
        return false;
      }
    }
    return true;
  }

  function hasSelection(map: Record<number, boolean>): boolean {
    for(let key in map){
      if( map[key] ){
        return true;
      }
    }
    return false;
  }

  function selectAll() {
    for(let d of drugs){
      selectedDrugs[d.id] = true;
    }
  }
</script>

<div class="wrapper">
  <div class="title">薬剤グループの編集</div>
  <div class="drugs">
    {#each drugs as drug (drug.id)}
      <div><input type="checkbox" bind:checked={selectedDrugs[drug.id]}/></div>
      <div>{drugRep(drug)}</div>
    {/each}
  </div>
  <DrugUsage
    bind:用法コード
    bind:用法名称
    bind:isEditing={isEditing用法コード}
  />
  {#if 剤形区分 === "内服" || 剤形区分 === "頓服"}
    <DrugDays bind:調剤数量 {剤形区分} bind:isEditing={isEditing調剤数量} />
  {/if}
  <div><YouhouHosoku bind:用法補足レコード /></div>
  <div><CogLink onClick={toggleAuxMenu} /></div>
  {#if showAuxMenu}
    <!-- svelte-ignore a11y-invalid-attribute -->
    <div>
      {#if youhouHosokuNotContains(用法補足レコード, "一包化")}
        <a
          href="javascript:void(0)"
          on:click={() => doAddYouhouHosoku("一包化")}>一包化</a
        >
      {/if}
      <a
        href="javascript:void(0)"
        on:click={() => doAddYouhouHosoku("用法の続き")}>用法補足</a
      >
    </div>
  {/if}
  <div class="commands">
    <Link onClick={selectAll}>全選択</Link>
    {#if hasSelection(selectedDrugs)}
    <!-- svelte-ignore a11y-invalid-attribute -->
    <a href="javascript:void(0)" on:click={doDelete}>削除</a>
    {/if}
    {#if !isEditing用法コード && !isEditing調剤数量}
      <button on:click={doEnter}>入力</button>
    {/if}
    <button on:click={onDone}>キャンセル</button>
  </div>
</div>

<style>
  .drugs {
    margin: 10px 0;
    padding: 10px;
    line-height: 1.5;
    display: grid;
    grid-template-columns: auto 1fr;
    border-bottom: 2px solid #ccc;
  }
  .commands {
    text-align: right;
  }
</style>
