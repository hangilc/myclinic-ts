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
  <path
    stroke-linecap="round"
    stroke-linejoin="round"
    d="M16.862 3.487a2.25 2.25 0 0 1 3.182 0l.469.469a2.25 2.25 0 0 1 0 3.182L9.75 18.001H6a.75.75 0 0 1-.75-.75v-3.75L16.862 3.487Z"
  />
  <path
    stroke-linecap="round"
    stroke-linejoin="round"
    d="m9.75 18.001 1.5-1.5"
  />
  <path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18" />
</svg>
