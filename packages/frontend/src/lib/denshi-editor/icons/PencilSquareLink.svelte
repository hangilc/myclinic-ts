<script lang="ts">
  import PencilSquare from "@/icons/PencilSquare.svelte";

  export let onClick: () => void = () => undefined;
</script>

<a href="javascript:void(0)" on:click={onClick}>
  <PencilSquare />
</a>

<style>
  a {
    position: relative;
    top: var(--pencil-square-icon-top, 2px);
  }
</style>