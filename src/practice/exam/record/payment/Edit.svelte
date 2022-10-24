<script lang="ts">
  import type { VisitEx } from "@/lib/model";
  import RightBox from "../../RightBox.svelte";

  export let visit: VisitEx;
  export let onClose: () => void;

  export function open(): void {
    show = true;
  }

  function close(){
    show = false;
    onClose();
  }
  let show = false;
</script>

{#if show}
<!-- svelte-ignore a11y-invalid-attribute -->
<RightBox title="請求額の変更">
  <div class="commands">
    <a href="javascript:void(0)">未収に</a>
    <a href="javascript:void(0)">領収書PDF</a>
    <button>入力</button>
    <button on:click={close}>キャンセル</button>
  </div>
</RightBox>
{/if}

<style>
  .commands {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .commands :global(a),
  .commands :global(button) {
    margin-left: 4px;
  }
</style>
