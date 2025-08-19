<script lang="ts">
  export let onClick: () => void;

  function doClick(e: MouseEvent): void {
    e.preventDefault();
    onClick();
  }
</script>
<!-- svelte-ignore a11y-invalid-attribute -->
<a href="javascript:void(0)" on:click={doClick}><slot /></a>

<style>
  a { 
    font-size: 14px;
    white-space: nowrap;
  }
</style>