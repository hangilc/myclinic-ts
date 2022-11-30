export function locateAtAnchor(e: HTMLElement, anchor: HTMLElement | SVGSVGElement): void {
  if (e != null && anchor != null) {
    const r = anchor.getBoundingClientRect();
    const t = e.getBoundingClientRect();
    const w = document.documentElement.clientWidth;
    if (r.left + t.width > w) {
      e.style.left = window.scrollX + w - t.width - 10 + "px";
    } else {
      e.style.left = window.scrollX + r.left + "px";
    }
    const h = document.documentElement.clientHeight;
    if (r.top + t.height > h) {
      e.style.top = window.scrollY + h - t.height - 10 + "px";
    } else {
      e.style.top = window.scrollY + r.top + r.height + 4 + "px";
    }
  }
}

