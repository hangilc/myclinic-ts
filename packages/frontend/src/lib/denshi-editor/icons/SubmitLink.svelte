<script lang="ts">
  import CheckCircle from "@/icons/CheckCircle.svelte";

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
  <CheckCircle color="currentColor" width="20"/>
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
