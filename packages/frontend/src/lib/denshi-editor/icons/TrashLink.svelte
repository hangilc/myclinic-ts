<script lang="ts">
  import Trash from "@/icons/Trash.svelte";

  export let onClick: () => void;
  export let style: string = "";
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<a
  href="javascript:void(0)"
  tabindex="-1"
  {style}
  on:click={onClick}
>
  <Trash width="18"/>
</a>

<style>
  a {
    position: relative;
	color: gray;
  }

  a:hover {
	color: red;
  }

  a :global(svg) {
	position: relative;
	top: 3px;
  }
</style>
