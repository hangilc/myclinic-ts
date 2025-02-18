<script lang="ts">
  export let width: string = "18";
  export let color: string = "gray";
  export let style: string = "";
  export let dx: string | undefined = undefined;
  export let dy: string | undefined = undefined;

  if (dy != undefined) {
    style += `margin-top: ${dy};`;
  }
  if (dx != undefined) {
    style += `margin-left: ${dx};`;
  }
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
  stroke-width="1.5"
  stroke={color}
  {width}
  {style}
>
  <path
    stroke-linecap="round"
    stroke-linejoin="round"
    d="M12 4.5v15m7.5-7.5h-15"
  />
</svg>
