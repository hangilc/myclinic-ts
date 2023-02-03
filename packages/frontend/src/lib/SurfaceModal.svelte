<script lang="ts">
  import { onDestroy } from "svelte";
  import Screen from "./Screen.svelte";
  import { alloc, release } from "./zindex";

  export let screenOpacity: string = "0.4";
  export let title: string = "Untitled";
  export let width: string = "auto";
  export let height: string = "auto";
  export let destroy: () => void;
  export let onClose: () => void = () => {};
  export let keyDown: (e: KeyboardEvent) => void = _ => {};
  export let allowEscapeClose: boolean = false;

  let zIndexScreen = alloc();
  let zIndexContent = alloc();

  const screen = new Screen({
    target: document.body,
    props: {
      zIndex: zIndexScreen,
      opacity: screenOpacity,
      onClick: doScreenClick,
    },
  });

  onDestroy(() => {
    screen.$destroy();
    release(zIndexContent);
    release(zIndexScreen);
    onClose();
  });

  function doScreenClick(ev: Event): void {
    ev.stopPropagation();
    ev.preventDefault();
  }

  function doKeyDown(event: KeyboardEvent): void {
    if( event.key === "Escape" && allowEscapeClose ){
      event.stopPropagation();
      destroy();
    } else {
      keyDown(event);
    }
  }
</script>

<div
  class="top dialog-top"
  style:z-index={zIndexContent}
  style:width
  style:height
  on:keydown={doKeyDown}
  tabindex="0"
  autofocus
  data-cy="dialog"
>
  <div class="title">
    <span class="title-span" data-cy="dialog-title">{title}</span>
    <svg
      on:click={destroy}
      class="closeIcon"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      width="16px"
      height="16px"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  </div>
  <slot />
</div>

<style>
  .top {
    position: fixed;
    top: 20px;
    left: 50vw;
    transform: translateX(-50%);
    background-color: white;
    padding: 0.5rem 1.5rem;
    opacity: 1;
    /* overflow: visible; */
    overflow: auto;
    border-radius: 0.5rem;
  }

  .top:focus {
    outline: none;
  }

  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .title-span {
    font-weight: bold;
  }

  .closeIcon {
    cursor: pointer;
  }
</style>
