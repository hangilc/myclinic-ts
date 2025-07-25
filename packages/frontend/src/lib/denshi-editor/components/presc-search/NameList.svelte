<script lang="ts">
  export let nameList: string[] | undefined;
  export let onClick: (name: string) => void;

</script>

{#if nameList !== undefined}
<ul>
  {#each nameList as name}
    <li>{name}</li>
  {/each}
</ul>
{/if}