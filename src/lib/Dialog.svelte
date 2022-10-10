<script type="ts">
  import Screen from "./Screen.svelte";
  import { alloc, release } from "./zindex";
  import { onMount, onDestroy } from "svelte";

  export let onClose: () => void;
  export let width: string = "260px";

  let content: HTMLElement;
  let zIndexScreen: number;
  let zIndexContent: number;

  onMount(() => {
    console.log("Dialog mount");
    zIndexScreen = alloc();
    zIndexContent = alloc();
  })
  onDestroy(() => {
    console.log("Dialog destroy");
    release(zIndexScreen);
    release(zIndexContent);
  })
</script>

<div>
  <Screen opacity="0.5" zIndex={zIndexScreen} />
  <div
    bind:this={content}
    class="dialog"
    style:z-index={zIndexContent}
    style:width={width}
  >
    <div class="title-wrapper">
      <slot name="title" /><img src="/xicon.svg" alt="xicon" on:click={onClose}/>
    </div>
    <slot />
    <slot name="commands"/>
  </div>
</div>

<style>
  .dialog {
    position: fixed;
    top: 20px;
    left: 50vw;
    transform: translateX(-50%);
    background-color: white;
    padding: 0.5rem 1.5rem;
    opacity: 1.0;
    overflow: auto;
    border-radius: 0.5rem;
  }

  .title-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
