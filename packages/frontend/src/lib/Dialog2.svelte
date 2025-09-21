<script lang="ts">
  import XMark from "@/icons/XMark.svelte";
  import Screen from "@/lib/Screen.svelte";
  import { alloc, release } from "./zindex";
  import { onDestroy, onMount } from "svelte";

  export let destroy: () => void;
  export let title = "Untitled";
  export let screenOpacity: string = "0.4";
  export let onClose: () => void = () => {};

  let dialog: HTMLElement;
  let zIndexScreen = alloc();
  let zIndexDialog = alloc();
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };
  let dialogPosition = { x: 0, y: 0 };

  onMount(() => {
    dialog.style.zIndex = zIndexDialog.toString();
    // initializePosition();
  });

  onDestroy(() => {
    if (zIndexDialog != undefined) {
      release(zIndexDialog);
    }
    if (zIndexScreen != undefined) {
      release(zIndexScreen);
    }
    screen.$destroy();
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    onClose();
  });

  const screen = new Screen({
    target: document.body,
    props: {
      zIndex: zIndexScreen,
      opacity: screenOpacity,
      onClick: doScreenClick,
    },
  });

  function doScreenClick(ev: Event): void {
    ev.stopPropagation();
    ev.preventDefault();
  }

  // function initializePosition() {
  //   const rect = dialog.getBoundingClientRect();
  //   dialogPosition.x = rect.left;
  //   dialogPosition.y = rect.top;
  //   updateDialogPosition();
  // }

  function updateDialogPosition() {
    dialog.style.left = `${dialogPosition.x}px`;
    dialog.style.top = `${dialogPosition.y}px`;
    dialog.style.transform = "none";
  }

  function handleTitleMouseDown(event: MouseEvent) {
    // Don't start drag if clicking on buttons
    const target = event.target as HTMLElement;
    if (target.tagName === "svg" || target.closest("svg")) {
      return;
    }

    isDragging = true;
    const rect = dialog.getBoundingClientRect();
    dragOffset.x = event.clientX - rect.left;
    dragOffset.y = event.clientY - rect.top;

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
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
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="top" bind:this={dialog}>
  <div class="title">
    <div class="title-text" on:mousedown={handleTitleMouseDown}>{title}</div>
    <div on:click={destroy} class="title-xmark"><XMark /></div>
  </div>
  <slot />
</div>

<style>
  .top {
    position: fixed;
    top: 20px;
    left: 50vw;
    transform: translateX(-60%);
    background-color: white;
    resize: var(--ui-dialog2-resize, none);
    overflow: var(--ui-dialog2-overflow, hidden);
  }

  .title {
    padding: 6px;
    display: grid;
    grid-template-columns: 1fr auto;
    cursor: move;
  }

  .title-text {
    font-weight: bold;
  }

  .title-xmark {
    cursor: pointer;
  }
</style>

