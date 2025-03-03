<script lang="ts">
  export let width: string = "18";
  export let color: string = "gray";
  export let style: string = "";
  export let dx: string | undefined = undefined;
  export let dy: string | undefined = undefined;
  export let onClick: (e: MouseEvent) => void = (_) => {};

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
  viewBox="0 0 240 240"
  {width}
  stroke={color}
  stroke-width="10"
  {style}
>
  <path
    stroke-linecap="round"
    stroke-linejoin="round"
    d="M 40 120 A 80 80 0 0 1 120 40 A 80 80 0 0 1 200 120 A 80 80 0 0 1 120 200 A 80 80 0 0 1 40 120"
  />
</svg>
