<script lang="ts">
  import type { PrescInfoDataEdit } from "../../denshi-edit";
  import SmallLink from "./SmallLink.svelte";

  export let data: PrescInfoDataEdit;
  export let onValidUpto: () => void;
  export let onAddBikou: () => void;
  export let onAddClinicalInfo: () => void;
  export let onAddExamInfo: () => void;
</script>

<div class="top">
  {#if data.使用期限年月日 == undefined}
    <SmallLink onClick={onValidUpto}>有効期限</SmallLink>
  {/if}
  <SmallLink onClick={onAddBikou}>備考追加</SmallLink>
  <SmallLink onClick={onAddClinicalInfo}>診療情報追加</SmallLink>
  <SmallLink onClick={onAddExamInfo}>検査情報追加</SmallLink>
</div>

<style>
  .top {
    margin: 10px 0;
  }
</style>
