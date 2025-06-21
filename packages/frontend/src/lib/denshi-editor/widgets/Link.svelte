<script lang="ts">
  export let onClick: () => void;
  export let style: string = "";
</script>

<a href="javascript:void(0)" on:click={onClick} {style}><slot /></a>

<style>
  a {
    white-space: nowrap;
  }
</style>