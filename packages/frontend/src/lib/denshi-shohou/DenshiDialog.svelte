<script lang="ts">
  import Dialog from "../Dialog.svelte";
  export let destroy: () => void;
  export let title = "電子処方箋編集";
</script>
<Dialog title={title} {destroy}>

</Dialog>