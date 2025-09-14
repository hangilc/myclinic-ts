<script lang="ts">
  export let onClick: () => void;

  function doClick(e: MouseEvent): void {
    e.preventDefault();
    onClick();
  }
</script>
<a href="#" on:click={doClick}><slot /></a>

<style>
</style>