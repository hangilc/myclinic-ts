<script lang="ts">
  import XCircle from "@/icons/XCircle.svelte";

  export let onClick: () => void;
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<a
  href="javascript:void(0)"
  style="position:relative;top:5px;margin-left:-4px;"
  tabindex="-1"
  on:click={onClick}
  >
  <XCircle color="#999" />
</a>
