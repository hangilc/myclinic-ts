<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";

  export let destroy: () => void;
  export let to: string;
  export let from: string;

  function doClose() {
    destroy();
  }
</script>

<Dialog title="メール送信" destroy={doClose}>
  <div>
    To: <input type="text" bind:value={to} />
  </div>
  <div>
    From: <input type="text" bind:value={from} />
  </div>
</Dialog>
