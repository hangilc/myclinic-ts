<script lang="ts">
  import XCircle from "@/icons/XCircle.svelte";

  export let onClick: () => void;
  export let style: string = "";
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<a href="javascript:void(0)" tabindex="-1" {style} on:click={onClick}>
  Cancel
  <XCircle color="currentColor" width="20" />
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
    top: 4.5px;
  }
</style>
