<script lang="ts">
  import type { 提供診療情報レコードEdit } from "../denshi-edit";
  import Label from "./leftarea/Label.svelte";
  import LeftArea from "./leftarea/LeftArea.svelte";

  export let info: 提供診療情報レコードEdit[] | undefined;
  export let onClick: (record: 提供診療情報レコードEdit) => void;
</script>

{#if info && info.length > 0}
  <LeftArea>
    <Label>提供診療情報</Label>
    {#each info as record (record.id)}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="rep" on:click={() => onClick(record)}>{record.コメント}</div>
    {/each}
  </LeftArea>
{/if}

<style>
  .rep {
    cursor: pointer;
  }
</style>
