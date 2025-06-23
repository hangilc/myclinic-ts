<script lang="ts">
  import CheckCircle from "@/icons/CheckCircle.svelte";

  export let onClick: () => void;
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<a
  href="javascript:void(0)"
  tabindex="-1"
  on:click={onClick}
>
  <CheckCircle color="currentColor" width="20"/>
</a>

<style>
  a {
    position: relative;
  }

  a :global(svg) {
	position: relative;
	top: 4.5px;
  }
</style>
