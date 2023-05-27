<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";

  export let destroy: () => void;
  export let memo: string | undefined;
  export let onEnter: (memo: string | undefined) => void;

  console.log(memo, memo === undefined);
  if ( !memo ) {
    memo = `{
      "comments": [
        {
          "code": 10,
          "text": ""
        }
      ]
    }`;
  }

  async function doEnter() {
    try {
      if( !memo ){
        memo = undefined;
      } else {
        const _json = JSON.stringify(memo);
      }
    } catch (_ex) {
      alert("Invalid JSON");
      return;
    }
    destroy();
    onEnter(memo);
  }

  function doClose(): void {
    destroy();
  }
</script>

<Dialog title="診療行為メモ編集" destroy={doClose}>
  <div class="form">
    <textarea bind:value={memo} />
  </div>
  <div>
    <button on:click={doEnter}>入力</button>
    <button on:click={doClose}>キャンセル</button>
  </div>
</Dialog>

<style>
  .form textarea {
    width: 20em;
    height: 20em;
    font-size: 14px;
  }
</style>
