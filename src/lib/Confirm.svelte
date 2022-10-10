<script lang="ts">

  import Dialog from "./Dialog.svelte"

  let show = false;
  let proc: () => void;
  export function confirm(f: () => void): void {
    show = true;
    proc = f;
  }
  export let text: string;

  function onEnter(): void {
    show = false;
    proc();
  }

</script>

{#if show}
<Dialog onClose={() => show = false} noTitle>
  <div>{text}</div>
  <div slot="commands" class="commands">
    <button on:click={onEnter}>実行</button>
    <button on:click={() => show = false}>キャンセル</button>
  </div>
</Dialog>
{/if}
