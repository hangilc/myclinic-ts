<script lang="ts">
  import MagnifyingGlass from "@/icons/MagnifyingGlass.svelte";

  export let onClick: () => void;
  export let style = "";
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<a
  href="javascript:void(0)"
  tabindex="-1"
  on:click={onClick}
  {style}
>
  <MagnifyingGlass width="20"/>
</a>

<style>
  a {
    position: relative;
    display: inline-block;
    width: 20px;
    height: 20px;
  }

  a :global(svg) {
	position: absolute;
  }
</style>
