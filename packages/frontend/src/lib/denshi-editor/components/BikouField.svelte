<script lang="ts">
  import type { 備考レコードEdit } from "../denshi-edit";
  import Label from "./leftarea/Label.svelte";
  import LeftArea from "./leftarea/LeftArea.svelte";

  export let bikou: 備考レコードEdit[] | undefined;
  export let onClick: (record: 備考レコードEdit) => void;
</script>

{#if bikou && bikou.length > 0}
<LeftArea>
  <Label>備考</Label>
  {#each bikou as record (record.id)}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="rep" on:click={() => onClick(record)}>{record.備考}</div>
  {/each}
</LeftArea>
{/if}

<style>
  .rep {
    cursor: pointer;
  }
</style>Z