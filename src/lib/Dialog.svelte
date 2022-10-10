<script type="ts">
  import Screen from "./Screen.svelte";
  import { alloc, release } from "./zindex";
  import { onMount, onDestroy } from "svelte";

  let show = false;
  export function open(): void {
    show = true;
  }
  export let width: string = "260px";
  export let noTitle = false;

  let content: HTMLElement;
  let zIndexScreen: number;
  let zIndexContent: number;

  function close(): void {
    show = false;
  }

  onMount(() => {
    zIndexScreen = alloc();
    zIndexContent = alloc();
  })
  onDestroy(() => {
    release(zIndexScreen);
    release(zIndexContent);
  })
</script>

{#if show}
<div>
  <Screen opacity="0.5" zIndex={zIndexScreen} />
  <div
    bind:this={content}
    class="dialog"
    style:z-index={zIndexContent}
    style:width={width}
  >
    {#if !noTitle}
    <div class="title-wrapper">
      <slot name="title" /><img src="/xicon.svg" alt="xicon" on:click={() => close()}/>
    </div>
    {/if}
    <slot close={close}/>
    <div class="commands">
      <slot name="commands"/>
    </div>
  </div>
</div>
{/if}

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
