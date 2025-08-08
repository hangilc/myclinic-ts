<script lang="ts">
  import Dialog2 from "../Dialog2.svelte";

  export let destroy: () => void;
  export let title = "確認";
</script>

<Dialog2 title={title} {destroy}>

</Dialog2>