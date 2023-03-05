<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";

  export let destroy: () => void;
  export let onConfirm: (kakunin: string) => void;

</script>

<Dialog title="オンライン資格確認" {destroy}>

</Dialog>

<style>
</style>
