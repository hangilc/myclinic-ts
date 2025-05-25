<script lang="ts">
  export let width: string = "18";
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
  stroke="currentColor"
  {width}
  {style}
>
  <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
</svg>
