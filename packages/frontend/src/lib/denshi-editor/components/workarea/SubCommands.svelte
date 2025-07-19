<script lang="ts">
  import type { PrescInfoDataEdit } from "../../denshi-edit";
  import SmallLink from "./SmallLink.svelte";

  export let data: PrescInfoDataEdit;
  export let onValidUpto: () => void;
  export let onEditBikou: () => void;
  export let onEditClinicalInfo: () => void;
  export let onEditExamInfo: () => void;

</script>

<div class="top">
  {#if data.使用期限年月日 == undefined}
    <SmallLink onClick={onValidUpto}>有効期限</SmallLink>
  {/if}
  <SmallLink onClick={onEditBikou}>備考編集</SmallLink>
  <SmallLink onClick={onEditClinicalInfo}>診療情報編集</SmallLink>
  <SmallLink onClick={onEditExamInfo}>検査情報編集</SmallLink>
</div>

<style>
  .top {
    margin: 10px 0;
  }
</style>
