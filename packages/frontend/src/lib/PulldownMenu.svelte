<script lang="ts">
  import { locateContextMenu, locatePulldown } from "./locator";
  import Screen from "./Screen.svelte";
  import { ViewportCoord } from "./viewport-coord";
  import { alloc, release } from "./zindex";

  export let items: () => [string, () => void][] = () => [];

  let wrapper: HTMLElement;
  let menu: HTMLElement;
  let anchor: HTMLElement | SVGSVGElement | ViewportCoord;

  let show = false;
  let destroy: () => void = () => {};

  function locate(): void {
    if (anchor instanceof ViewportCoord) {
      locateContextMenu(wrapper, anchor, menu);
    } else {
      locatePulldown(wrapper, anchor, menu);
    }
  }

  function doClick(act: () => void): void {
    destroy();
    console.log("pull down menu item click");
    act();
  }

  function trigger(event: MouseEvent): void {
    anchor = event.currentTarget as HTMLElement | SVGSVGElement;
    show = true;
  }

  function triggerClick(event: MouseEvent): void {
    event.preventDefault();
    anchor = ViewportCoord.fromEvent(event);
    show = true;
  }

  function open(e: HTMLElement): void {
    const zIndexScreen = alloc();
    const zIndexMenu = alloc();
    const parent = e.parentElement;
    console.log("parent", parent);
    destroy = () => {
      show = false;
      screen.$destroy();
      e.style.zIndex = "";
      release(zIndexMenu);
      release(zIndexScreen);
    };
    const screen = new Screen({
      target: document.body,
      props: {
        zIndex: zIndexScreen,
        onClick: () => {
          console.log("screen click");
          destroy()
        },
        opacity: "0.3",
      },
    });
    document.body.appendChild(e);
    const r = e.getBoundingClientRect();
    e.style.width = r.width + "px";
    e.style.zIndex = zIndexMenu.toString();
    parent?.appendChild(e);
    menu = e;
    locate();
  }

  function doMenuClick(e: MouseEvent) {
    console.log("menu click");
  }
</script>

<div class="top">
  <div class="wrapper" bind:this={wrapper}>
    {#if show}
      <div class="menu" on:click={doMenuClick} use:open>
        <slot name="menu" />
        {#each items() as item}
          {@const [text, action] = item}
          <a href="javascript:void(0)" on:click={() => doClick(action)}>{text}</a
          >
        {/each}
      </div>
    {/if}
  </div>
</div>
<slot {trigger} {triggerClick} {destroy}/>

<style>
  .top {
    display: block;
    font-weight: normal;
    text-align: left;
    line-height: 1;
    position: relative;
    width: 0;
    height: 0;
  }

  .wrapper {
    position: relative;
  }

  .menu {
    margin: 0;
    padding: 10px;
    background-color: white;
    opacity: 1;
    line-height: 1;
    border: 1px solid gray;
    position: absolute;
    box-sizing: border-box;
    isolation: isolate;
  }

  .menu a {
    display: block;
    margin-bottom: 4px;
  }

  .menu a:last-of-type {
    margin-bottom: 0;
  }
</style>
