import PopupMenu from "./PopupMenu.svelte"
import { alloc, release } from "./zindex";
import Screen from "./Screen.svelte";

export function popupTrigger(menu: () => [string, () => void][]): (event: MouseEvent) => void {
  return (event: MouseEvent) => {
    const p: PopupMenu = new PopupMenu({
      target: document.body,
      props: {
        destroy: () => p.$destroy(),
        menu: menu(),
        event
      }
    });
  }
}

export function popupTriggerAdmin(
  isAdmin: () => boolean, adminMenus: () => [string, () => void][], menus: () => [string, () => void][]):
  (event: MouseEvent) => void {
  function f(): [string, () => void][] {
    const m: [string, () => void][] = [];
    if (isAdmin()) {
      m.push(...adminMenus());
    }
    m.push(...menus());
    return m;
  }
  return popupTrigger(f);
}

export function popupTriggerAsync(menu: () => Promise<[string, () => void][]>): (event: MouseEvent) => void {
  return async (event: MouseEvent) => {
    const m = await menu();
    console.log("event", event);
    const p: PopupMenu = new PopupMenu({
      target: document.body,
      props: {
        destroy: () => p.$destroy(),
        menu: m,
        event
      }
    });
  }
}

type Locator = (e: HTMLElement, dispose: () => void) => (() => void);

type ContextMenuOpt = {
  offsetX?: number,
  offsetY?: number;
}

class PopupContext {
  zIndexScreen: number;
  zIndexMenu: number;
  screen: Screen;
  resizeHandler: ((e: UIEvent) => void) | undefined = undefined;

  constructor(e: HTMLElement, screenClickHandler: () => void) {
    this.zIndexScreen = alloc();
    this.zIndexMenu = alloc();
    this.screen = new Screen({
      target: document.body,
      props: {
        zIndex: this.zIndexScreen,
        onClick: () => {
          screenClickHandler();
        },
        opacity: "0",
      },
    });
    e.style.zIndex = this.zIndexMenu.toString();
  }

  discard() {
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
    }
    this.screen.$destroy();
    release(this.zIndexMenu);
    release(this.zIndexScreen);
  }
}

export function contextMenuLocator(event: MouseEvent, opt: ContextMenuOpt = {}): Locator {
  return (e: HTMLElement, dispose: () => void) => {
    const offsetX = opt.offsetX ?? 4;
    const offsetY = opt.offsetY ?? 4;
    const clickX = event.clientX;
    const clickY = event.clientY;
    const ctx = new PopupContext(e, dispose);
    e.style.left = window.scrollX + clickX + offsetX + "px";
    e.style.top = window.scrollY + clickY + offsetY + "px";
    return () => ctx.discard();
  }
}


