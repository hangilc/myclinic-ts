<script lang="ts">
  
  export let width: string = "18"
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
  <svg
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
  stroke-width="1.5"
  stroke="currentColor"
  {width}
>
  <path
    stroke-linecap="round"
    stroke-linejoin="round"
    d="m4.5 15.75 7.5-7.5 7.5 7.5"
  />
</svg>
</a>

<style>
  a {
    position: relative;
	color: gray;
  }

  a:hover {
	color: black;
  }

  a :global(svg) {
	position: relative;
	top: 3px;
  }
</style>