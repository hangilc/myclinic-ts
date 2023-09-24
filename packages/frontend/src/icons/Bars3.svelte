<script lang="ts">
  export let width: string = "18";
  export let color: string = "gray";
  export let style: string = "";
  export let dx: string | undefined = undefined;
  export let dy: string | undefined = undefined;
  export let onClick: (event: MouseEvent) => void = _ => {};
  export let dataCy: string = "";

  if (dy != undefined) {
    style += `margin-top: ${dy};`;
  }
  if (dx != undefined) {
    style += `margin-left: ${dx};`;
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<svg
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
  stroke-width="1.5"
  {width}
  stroke={color}
  {style}
  on:click={onClick}
  data-cy={dataCy}
>
  <path
    stroke-linecap="round"
    stroke-linejoin="round"
    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
  />
</svg>

