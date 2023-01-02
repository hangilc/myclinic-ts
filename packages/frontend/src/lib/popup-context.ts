import { alloc, release } from "./zindex";
import Screen from "@/lib/Screen.svelte";
import { locatePulldown, syncLocation, locateContextMenu } from "./popup-locator";
import type { ViewportCoord } from "./viewport-coord";

export class PopupContext {
  zIndexScreen: number;
  zIndexMenu: number;
  menuWrapper: HTMLElement | null;
  screen: Screen;
  resizeHandler: ((e: UIEvent) => void) | undefined = undefined;

  constructor(
    public anchor: HTMLElement | SVGSVGElement,
    public menu: HTMLElement,
    public clickLocation: ViewportCoord | undefined,
    onDestroy: () => void
  ) {
    this.zIndexScreen = alloc();
    this.zIndexMenu = alloc();
    this.menuWrapper = menu.parentElement;
    this.screen = new Screen({
      target: document.body,
      props: {
        zIndex: this.zIndexScreen,
        onClick: onDestroy,
        opacity: "0",
      },
    });
    menu.style.zIndex = this.zIndexMenu.toString();
    document.body.appendChild(menu);
    const r = menu.getBoundingClientRect();
    menu.style.width = r.width + "px";
    let [dx, dy]: [number, number] = [0, 0];
    if( clickLocation ){
      [dx, dy] = locateContextMenu(anchor, menu, clickLocation);
    } else {
      [dx, dy] = locatePulldown(anchor, menu);
    }
    let syncTimer: any = undefined;
    this.resizeHandler = (_evt) => {
      if (!syncTimer) {
        syncTimer = setTimeout(() => {
          syncLocation(anchor, menu, dx, dy);
          syncTimer = undefined;
        }, 250);
      }
    };
    window.addEventListener("resize", this.resizeHandler);
    menu.focus();
  }

  destroy(): void {
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
    }
    this.menuWrapper?.append(this.menu);
    this.screen.$destroy();
    this.menu.style.zIndex = "auto";
    release(this.zIndexMenu);
    release(this.zIndexScreen);
  }
}
