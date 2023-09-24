<script lang="ts">

  export let destroy: () => void;
  export let locator: (e: HTMLElement, dispose: () => void) => (() => void);
  export let modifier: (e: HTMLElement) => void = (_) => {};
  
  let discard: () => void = () => {};

  function dispose() {
    discard();
    destroy();
  }

  function open(e: HTMLElement): void {
    discard = locator(e, dispose);
    modifier(e);
  }

  function doMenuKey(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      event.stopPropagation();
      destroy();
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div class="menu" on:keydown={doMenuKey} use:open tabindex="0"><slot {dispose}/></div>

<style>
  .menu {
    position: absolute;
    margin: 0;
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid gray;
    background-color: white;
    opacity: 1;
  }

  .menu:focus {
    outline: none;
  }
</style>
