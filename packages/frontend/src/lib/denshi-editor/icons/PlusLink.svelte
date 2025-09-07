<script lang="ts">
  export let onClick: (event: MouseEvent) => void = () => undefined;
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<a href="javascript:void(0)" on:click={onClick}>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    width="18"
    height="18"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M12 4.5v15m7.5-7.5h-15"
    />
  </svg>
</a>

<style>
  a {
    position: relative;
    top: var(--ui-plus-link-top, 0);
  }
</style>