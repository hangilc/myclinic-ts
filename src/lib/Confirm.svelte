<script lang="ts">

  import Dialog from "./Dialog.svelte"

  export let onClose: () => void;
  export let text: string;
  let show = false;

</script>

<Dialog onClose={onClose} noTitle>
  <div>{text}</div>
  <div slot="commands">
    <button on:click={() => {}}>実行</button>
    <button on:click={onClose}>キャンセル</button>
  </div>
</Dialog>
