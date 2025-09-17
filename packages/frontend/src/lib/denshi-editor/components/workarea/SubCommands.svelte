<script lang="ts">
  import type { PrescInfoDataEdit } from "../../denshi-edit";
  import SmallLink from "./SmallLink.svelte";

  export let data: PrescInfoDataEdit;
  export let onValidUpto: () => void;
  export let onAddBikou: () => void;
  export let onAddClinicalInfo: () => void;
  export let onAddExamInfo: () => void;
  export let onReorder: () => void;
  export let onChooseKouhi: () => void;
  export let onDrugNameConvEditor: () => void;
  export let onDrugUsageConvEditor: () => void;
  export let onDrugPrefabEditor: () => void;
  export let onPasteShohouList: () => void;
</script>

<div class="top">
  {#if data.使用期限年月日 == undefined}
    <SmallLink onClick={onValidUpto}>有効期限</SmallLink>
  {/if}
  <SmallLink onClick={onAddBikou}>備考追加</SmallLink>
  <SmallLink onClick={onAddClinicalInfo}>診療情報追加</SmallLink>
  <SmallLink onClick={onAddExamInfo}>検査情報追加</SmallLink>
  {#if data.RP剤情報グループ.length > 1}
    <SmallLink onClick={onReorder}>順序変種</SmallLink>
  {/if}
  {#if data.hasKouhi()}
    <SmallLink onClick={onChooseKouhi}>公費選択</SmallLink>
  {/if}
  <SmallLink onClick={onDrugNameConvEditor}>薬品名変換管理</SmallLink>
  <SmallLink onClick={onDrugUsageConvEditor}>用法変換管理</SmallLink>
  <SmallLink onClick={onDrugPrefabEditor}>処方例管理</SmallLink>
  <SmallLink onClick={onPasteShohouList}>処方リスト貼付</SmallLink>
</div>

<style>
  .top {
    margin: 10px 0;
  }
</style>
