<script lang="ts">
  import { locatePulldown } from "./locator";
  import Screen from "./Screen.svelte";
  import { alloc, release } from "./zindex";

  let wrapper: HTMLElement;
  let menu: HTMLElement;
  let anchor: HTMLElement | SVGSVGElement;

  export let items: [string, () => void][] = [];
  let show = false;

  function doClick(act: () => void): void {}

  function trigger(event: MouseEvent): void {
    anchor = event.currentTarget as HTMLElement | SVGSVGElement;
    console.log(anchor);
    show = true;
  }

  function open(e: HTMLElement | SVGSVGElement): void {
    const zIndexScreen = alloc();
    const zIndexMenu = alloc();
    function destroy(): void {
      show = false;
      screen.$destroy();
      e.style.zIndex = "";
      release(zIndexMenu);
      release(zIndexScreen);
    }
    const screen = new Screen({
      target: document.body,
      props: {
        zIndex: zIndexScreen,
        onClick: () => destroy(),
      },
    });
    const parent = e.parentElement;
    e.style.zIndex = zIndexMenu.toString();
    document.body.appendChild(e);
    const r = e.getBoundingClientRect();
    e.style.width = r.width + "px";
    parent?.appendChild(e);
    locatePulldown(wrapper, anchor, menu);
  }
</script>

<div class="top">
  <div class="wrapper" bind:this={wrapper}>
    {#if show}
      <div class="menu" bind:this={menu} use:open>
        {#each items as item}
          {@const [text, action] = item}
          <a href="javascript:void(0" on:click={() => doClick(action)}>{text}</a
          >
        {/each}
      </div>
    {/if}
  </div>
</div>
<slot {trigger}/>

<style>
  .top {
    display: inline-block;
    font-weight: normal;
    text-align: left;
    line-height: 1;
    position: relative;
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
  }

  .menu a {
    display: block;
    margin-bottom: 4px;
  }

  .menu a:last-of-type {
    margin-bottom: 0;
  }
</style>
