<script lang="ts">
  import XCircle from "@/icons/XCircle.svelte";

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
  <XCircle color="currentColor" width="18" />
</a>

<style>
  a {
    color: gray;
    position: relative;
  }

  a:hover {
	color: red;
  }

  a :global(svg) {
	position: relative;
	top: 4.5px;
	left: -2px;
  }
</style>

