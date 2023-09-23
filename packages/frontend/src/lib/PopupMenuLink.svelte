<script lang="ts">
  import type { PopupMenuItem } from "./popup-helper";

  export let item: PopupMenuItem;
  export let popupDestroy: () => void;
  let [label, action, opt] = item;

  let modifier = opt?.modifier ?? ((_) => {});
</script>

<a
  href="javascript:void(0)"
  on:click={() => {
    popupDestroy();
    action();
  }}
  use:modifier>{label}</a
>

<style>
  a {
    display: block;
    /* color: black; */
    line-height: 1;
  }
</style>
