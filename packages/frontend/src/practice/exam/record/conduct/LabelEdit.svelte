<script lang="ts">
    import api from "@/lib/api";


  import type { ConductEx } from "myclinic-model";

  let show = false;
  export let conduct: ConductEx;
  export let onClose: () => void;
  let input: HTMLInputElement;

  export function open(): void {
    show = true;
  }

  function close(): void {
    show = false;
    onClose();
  }

  async function doEnter(){
    const t = input.value.trim();
    await api.setGazouLabel({
      conductId: conduct.conductId,
      label: t
    });
    close();
  }

</script>

{#if show}
  <div class="top">
    <div class="title">画像ラベル編集</div>
    <input type="text" value={conduct.gazouLabel || ""} bind:this={input} />
    <div class="commands">
      <button on:click={doEnter}>入力</button>
      <button on:click={close}>キャンセル</button>
    </div>
  </div>
{/if}

<style>
  .top {
    margin: 10px 0;
    border: 1px solid gray;
    padding: 10px;
  }

  .title {
    font-weight: bold;
    margin-bottom: 10px;
  }

  .commands {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }

  .commands :global(button){
    margin-left: 4px;
  }
</style>
