<script lang="ts">
  export let nameList: string[] | undefined;
  export let onClick: (name: string) => void;
</script>

{#if nameList !== undefined}
  <ul>
    {#each nameList as name}
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <li on:click={() => onClick(name)}>{name}</li>
    {/each}
  </ul>
{/if}

<style>
  li {
    cursor: pointer;
  }
</style>
