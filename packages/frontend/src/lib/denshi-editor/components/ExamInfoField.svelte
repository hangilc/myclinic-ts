<script lang="ts">
  import type { 検査値データ等レコードEdit } from "../denshi-edit";
  import Label from "./leftarea/Label.svelte";
  import LeftArea from "./leftarea/LeftArea.svelte";

  export let info: 検査値データ等レコードEdit[] | undefined;
  export let onClick: (record: 検査値データ等レコードEdit) => void;
</script>

{#if info && info.length > 0}
  <LeftArea>
    <Label>検査結果情報</Label>
    {#each info as record (record.id)}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="rep" on:click={() => onClick(record)}>{record.検査値データ等}</div>
    {/each}
  </LeftArea>
{/if}

<style>
  .rep {
    cursor: pointer;
  }
</style>
