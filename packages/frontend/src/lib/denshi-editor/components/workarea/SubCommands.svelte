<script lang="ts">
  import type { PrescInfoDataEdit } from "../../denshi-edit";
  import SmallLink from "./SmallLink.svelte";

  export let data: PrescInfoDataEdit;
  export let onValidUpto: () => void;
  export let onEditBikou: () => void;

</script>

<div class="top">
  {#if data.使用期限年月日 == undefined}
    <SmallLink onClick={onValidUpto}>有効期限</SmallLink>
  {/if}
  <SmallLink onClick={onEditBikou}>備考編集</SmallLink>
</div>

<style>
  .top {
    margin: 10px 0;
  }
</style>
