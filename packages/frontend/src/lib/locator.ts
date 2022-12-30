import type { ViewportCoord } from "./viewport-coord";

export function locateAtAnchor(
  e: HTMLElement,
  anchor: HTMLElement | SVGSVGElement
): void {
  if (e != null && anchor != null) {
    const r = anchor.getBoundingClientRect();
    const t = e.getBoundingClientRect();
    const w = document.documentElement.clientWidth;
    {
      e.style.left = "0px";
      const tt = e.getBoundingClientRect();
      e.style.width = tt.width + "px";
    }
    if (r.left + t.width > w) {
      e.style.left = window.scrollX + w - t.width - 10 + "px";
    } else {
      e.style.left = window.scrollX + r.left + "px";
      console.log(e.getBoundingClientRect());
    }
    const h = document.documentElement.clientHeight;
    if (r.top + t.height > h) {
      e.style.top = window.scrollY + h - t.height - 10 + "px";
    } else {
      e.style.top = window.scrollY + r.top + r.height + 4 + "px";
    }
  }
}

export function locateAtPoint(e: HTMLElement, anchor: ViewportCoord): void {
  const {x, y} = anchor;
  const t = e.getBoundingClientRect();
  const w = document.documentElement.clientWidth;
  if (x + t.width > w) {
    e.style.left = window.scrollX + w - t.width - 10 + "px";
  } else {
    e.style.left = window.scrollX + x + 4 + "px";
  }
  const h = document.documentElement.clientHeight;
  if (y + t.height > h) {
    e.style.top = window.scrollY + h - t.height - 10 + "px";
  } else {
    e.style.top = window.scrollY + y + 4 + "px";
  }
}
