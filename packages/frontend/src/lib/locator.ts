import type { AbsoluteCoord } from "./absolute-coord";

export function locatePulldown(
  wrapper: HTMLElement,
  anchor: HTMLElement | SVGSVGElement,
  ele: HTMLElement
): void {
  const wrapperRect = wrapper.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();
  const eleRect = ele.getBoundingClientRect();
  const win = document.documentElement;
  const dx = anchorRect.left - wrapperRect.left;
  const dy = anchorRect.top - wrapperRect.top;
  function setLeft(left: number): void {
    ele.style.left = left + dx + "px";
  }
  function setTop(top: number): void {
    ele.style.top = top + dy + "px";
  }
  if (anchorRect.left + eleRect.width > win.clientWidth - 4) {
    setLeft(anchorRect.width - eleRect.width);
  } else {
    setLeft(0);
  }
  if( anchorRect.bottom + eleRect.height > win.clientHeight - 4 ){
    setTop(-eleRect.height - 4);
  } else {
    setTop(anchorRect.height + 4);
  }
}

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
    }
    const h = document.documentElement.clientHeight;
    if (r.top + t.height > h) {
      e.style.top = window.scrollY + h - t.height - 10 + "px";
    } else {
      e.style.top = window.scrollY + r.top + r.height + 4 + "px";
    }
  }
}

export function locateAtPoint(e: HTMLElement, anchor: AbsoluteCoord): void {
  console.log("locateAtPoint");
  let { x, y } = anchor;
  x -= window.scrollX;
  y -= window.scrollY;
  const t = e.getBoundingClientRect();
  const w = document.documentElement.clientWidth;
  {
    e.style.left = "0px";
    const tt = e.getBoundingClientRect();
    e.style.width = tt.width + "px";
  }
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
