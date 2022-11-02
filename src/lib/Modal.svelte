<script type="ts">
  import Screen from "./Screen.svelte";
  import { alloc, release } from "./zindex";

  export let screenOpacity: string = "0.5"

  let show = false;
  export function open(): void {
    zIndexScreen = alloc();
    zIndexContent = alloc();
    show = true;
  }
  export let onClose: () => void = () => {};

  let content: HTMLElement;
  let zIndexScreen: number;
  let zIndexContent: number;

  function close(): void {
    show = false;
    release(zIndexScreen);
    release(zIndexContent);
    onClose();
  }

</script>

{#if show}
<div>
  <Screen opacity={screenOpacity} zIndex={zIndexScreen} />
  <div
    bind:this={content}
    class="modal"
    style:z-index={zIndexContent}
  >
    <slot close={close}/>
  </div>
</div>
{/if}

<style>
  .modal {
    position: absolute;
    padding: 0.5rem 1.5rem;
    background-color: white;
    opacity: 1.0;
    overflow: auto;
    border-radius: 0.5rem;
    border: 1px solid gray;
  }
</style>
