<script lang="ts">
  import { alloc, release } from "./zindex";
  import Screen from "./Screen.svelte";
  import { onDestroy, onMount } from "svelte";

  export let destroy: () => void;
  export let title: string;
  export let onClose: () => void = () => {};
  export let styleWidth: string = "";
  export let screenOpacity: string = "0.4";
  export let keyDown: (e: KeyboardEvent) => void = (_) => {};
  export let allowEscapeClose: boolean = false;
  export let enableAutoFocus = false;

  let dialog: HTMLElement;
  let titleBar: HTMLElement;

  let zIndexScreen = alloc();
  let zIndexDialog = alloc();

  // Drag state management
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };
  let dialogPosition = { x: 0, y: 0 };

  const screen = new Screen({
    target: document.body,
    props: {
      zIndex: zIndexScreen,
      opacity: screenOpacity,
      onClick: doScreenClick,
    },
  });

  let fixed = true;

  function doScreenClick(ev: Event): void {
    ev.stopPropagation();
    ev.preventDefault();
  }

  onDestroy(() => {
    if (zIndexDialog != undefined) {
      release(zIndexDialog);
    }
    if (zIndexScreen != undefined) {
      release(zIndexScreen);
    }
    screen.$destroy();
    // Clean up drag event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    onClose();
  });

  onMount(() => {
    dialog.style.zIndex = zIndexDialog.toString();
    if( enableAutoFocus ){
      dialog.focus();
    }
    initializePosition();
  });

  function doKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape" && allowEscapeClose) {
      event.stopPropagation();
      destroy();
    } else {
      keyDown(event);
    }
  }

  function doUnfix() {
    dialog.style.position = "absolute";
    fixed = false;
  }

  function doFix() {
    dialog.style.position = "fixed";
    fixed = true;
  }

  function initializePosition() {
    const rect = dialog.getBoundingClientRect();
    dialogPosition.x = rect.left;
    dialogPosition.y = rect.top;
    updateDialogPosition();
  }

  function updateDialogPosition() {
    dialog.style.left = `${dialogPosition.x}px`;
    dialog.style.top = `${dialogPosition.y}px`;
    dialog.style.transform = "none";
  }

  function handleTitleMouseDown(event: MouseEvent) {
    // Don't start drag if clicking on buttons
    const target = event.target as HTMLElement;
    if (target.tagName === 'svg' || target.closest('svg')) {
      return;
    }

    isDragging = true;
    const rect = dialog.getBoundingClientRect();
    dragOffset.x = event.clientX - rect.left;
    dragOffset.y = event.clientY - rect.top;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    event.preventDefault();
  }

  function handleMouseMove(event: MouseEvent) {
    if (!isDragging) return;

    const newX = event.clientX - dragOffset.x;
    const newY = event.clientY - dragOffset.y;

    // Boundary checks
    const maxX = window.innerWidth - dialog.offsetWidth;
    const maxY = window.innerHeight - dialog.offsetHeight;

    dialogPosition.x = Math.max(0, Math.min(newX, maxX));
    dialogPosition.y = Math.max(0, Math.min(newY, maxY));

    updateDialogPosition();
  }

  function handleMouseUp() {
    isDragging = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="dialog"
  bind:this={dialog}
  data-cy="dialog"
  data-title={title}
  style:width={styleWidth}
  on:keydown={doKeyDown}
  tabindex="0"
>
  <div class="title" data-cy="dialog-title" bind:this={titleBar} on:mousedown={handleTitleMouseDown}>
    <span style="user-select:none;">{title}</span>
    <span class="spacer" />
    {#if fixed}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="#999"
        width="16px"
        height="16px"
        data-cy="arrow-turn-down"
        on:click={doUnfix}
      >
        <title>下の部分までスクロールできるようにします</title>
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15 15l-6 6m0 0l-6-6m6 6V9a6 6 0 0112 0v3"
        />
      </svg>
    {:else}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="#999"
        width="16px"
        height="16px"
        data-cy="arrow-turn-up"
        on:click={doFix}
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9 9l6-6m0 0l6 6m-6-6v12a6 6 0 01-12 0v-3"
        />
      </svg>
    {/if}
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
      data-cy="cross-icon"
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
  .dialog {
    position: fixed;
    margin: 0;
    top: 20px;
    left: 50vw;
    transform: translateX(-60%);
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid gray;
    background-color: white;
    opacity: 1;
    border-radius: 8px;
    max-height: calc(100vh - 40px);
    overflow-y: auto;
  }

  .dialog:focus {
    outline: none;
  }

  .title {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    cursor: move;
    user-select: none;
  }

  .title .spacer {
    flex-grow: 1;
  }

  .title span {
    font-weight: bold;
  }

  .title svg {
    cursor: pointer;
    margin-left: 6px;
  }
</style>
