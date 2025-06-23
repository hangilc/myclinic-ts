<script lang="ts">
  export let onClick: () => void;
  export let style: string = "";
  export let visible = true;
</script>

{#if visible}
<a href="javascript:void(0)" on:click={onClick} {style}><slot /></a>
{/if}

<style>
  a {
    white-space: nowrap;
    font-size: 14px;
  }
</style>