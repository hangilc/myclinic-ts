<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";

  export let destroy: () => void;
</script>

<Dialog destroy={destroy} title="顔認証データ" styleWidth="500px">
  <textarea class="face-confirm-data" />

</Dialog>

<style>
  .face-confirm-data {
    width: 100%;
    height: 100px;
    box-sizing: border-box;
  }
</style>