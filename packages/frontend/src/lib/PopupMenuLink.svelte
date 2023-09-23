<script lang="ts">
  import type { PopupMenuItem } from "./popup-helper";

  export let item: PopupMenuItem;
  let [label, action, opt] = item;

  let modifier = opt?.modifier ?? ((_) => {});
</script>

<a href="javascript:void(0)" on:click={action} use:modifier>{label}</a>



