import PopupMenu from "@/lib/PopupMenu.svelte"
import { alloc, release } from "./zindex";
import Screen from "./Screen.svelte";

export type PopupMenuItemOpt = {
  modifier?: (a: HTMLAnchorElement) => void;
}

export function dataCySetter(value: string): PopupMenuItemOpt {
  return {
    modifier: (a: HTMLAnchorElement) => {
      a.setAttribute("data-cy", value);
    }
  }
}

export type PopupMenuItem = [string, () => void, PopupMenuItemOpt?]

export type PopupTriggerOpt = {
  modifier?: (menu: HTMLElement) => void;
}

export function popupTrigger(menu: () => PopupMenuItem[], opt: PopupTriggerOpt = {}): (event: MouseEvent) => void {
  return (event: MouseEvent) => {
    const p: PopupMenu = new PopupMenu({
      target: document.body,
      props: {
        destroy: () => p.$destroy(),
        menu: menu(),
        event,
        modifier: opt.modifier ?? ((_) => {}),
      }
    });
  }
}

export function popupTriggerAsync(menu: () => Promise<PopupMenuItem[]>): (event: MouseEvent) => void {
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

class PopupContext {
  zIndexScreen: number;
  zIndexMenu: number;
  screen: Screen;
  resizeHandler: ((e: UIEvent) => void) | undefined = undefined;

  constructor(e: HTMLElement, anchor: HTMLElement | SVGElement, dx: number, dy: number, screenClickHandler: () => void) {
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
    let syncTimer: any = undefined;
    this.resizeHandler = (_evt) => {
      if (!syncTimer) {
        syncTimer = setTimeout(() => {
          syncLocation(anchor, e, dx, dy);
          syncTimer = undefined;
        }, 250);
      }
    };
    window.addEventListener("resize", this.resizeHandler);
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

type Locator = (e: HTMLElement, dispose: () => void) => (() => void);

export type OverflowHandlerArg = {
  eleSize: number, winWidth: number, winHeight: number, clickedAt: number, offset: number
}

type ContextMenuOpt = {
  offsetX?: number;
  offsetY?: number;
  rightOverflow?: (arg: OverflowHandlerArg) => number;
  bottomOverflow?: (arg: OverflowHandlerArg) => number;
}

function defaultOverflowHandler(arg: OverflowHandlerArg): number {
  return arg.clickedAt - arg.eleSize - arg.offset;
}

export function contextMenuLocator(event: MouseEvent, opt: ContextMenuOpt = {}): Locator {
  return (ele: HTMLElement, dispose: () => void) => {
    const offsetX = opt.offsetX ?? 4;
    const offsetY = opt.offsetY ?? 4;
    const clickX = event.clientX;
    const clickY = event.clientY;
    let anchor: HTMLElement | SVGElement = (event.currentTarget || event.target) as HTMLElement | SVGElement;
    let anchorRect = anchor.getBoundingClientRect();
    ele.style.left = "0";
    ele.style.top = "0";
    ele.style.width = "auto";
    let eleRect = ele.getBoundingClientRect();
    let dx = clickX - anchorRect.x + offsetX;
    let dy = clickY - anchorRect.y + offsetY;
    let win = document.documentElement;
    if (anchorRect.x + dx + eleRect.width > win.clientWidth) {
      let handler = opt.rightOverflow ?? defaultOverflowHandler;
      dx = handler({
        eleSize: eleRect.width,
        winWidth: win.clientWidth,
        winHeight: win.clientHeight,
        clickedAt: clickX,
        offset: offsetX,
      }) - anchorRect.x;
    }
    if (anchorRect.y + dy + eleRect.height > win.clientHeight) {
      let handler = opt.bottomOverflow ?? defaultOverflowHandler;
      dy = handler({
        eleSize: eleRect.height,
        winWidth: win.clientWidth,
        winHeight: win.clientHeight,
        clickedAt: clickY,
        offset: offsetY,
      }) - anchorRect.y;
    }
    ele.style.left = window.scrollX + anchorRect.x + dx + "px";
    ele.style.top = window.scrollY + anchorRect.y + dy + "px";
    const ctx = new PopupContext(ele, anchor, dx, dy, dispose);
    return () => ctx.discard();
  }
}

function syncLocation(
  anchor: HTMLElement | SVGElement,
  menu: HTMLElement,
  dx: number,
  dy: number
): void {
  const anchorRect = anchor.getBoundingClientRect();
  menu.style.left = window.scrollX + anchorRect.x + dx + "px";
  menu.style.top = window.scrollY + anchorRect.y + dy + "px";
}



