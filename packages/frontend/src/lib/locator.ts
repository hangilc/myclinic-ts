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
      console.log("t", t);
      console.log("tt", tt);
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

export function locateAtPoint(e: HTMLElement, anchor: [number, number]): void {
  const [x, y] = anchor;
  const t = e.getBoundingClientRect();
  const w = document.documentElement.clientWidth;
  if (x + t.width > w) {
    e.style.left = w - t.width - 10 + "px";
  } else {
    e.style.left = x + 4 + "px";
  }
  const h = document.documentElement.clientHeight;
  if (y + t.height > h) {
    e.style.top = h - t.height - 10 + "px";
  } else {
    e.style.top = y + 4 + "px";
  }
}
