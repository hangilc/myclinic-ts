<script lang="ts">
  import ArrowUpDown from "@/icons/ArrowUpDown.svelte";

  export let onClick: (e: MouseEvent) => void = () => undefined;

</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<a href="javascript:void(0)" on:click={onClick}>
  <ArrowUpDown />
</a>

<style>
  a {
    position: relative;
    top: var(--arrow-up-down-icon-top, 2px);
  }
</style>
