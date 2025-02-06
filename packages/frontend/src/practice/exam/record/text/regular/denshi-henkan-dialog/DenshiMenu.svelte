<script lang="ts">
  import Plus from "@/icons/Plus.svelte";

  export let onPlus: () => void;
</script>
<div>
  <a href="javascript:void(0)" on:click={onPlus}>
    <Plus color="blue"/>
  </a>
</div>