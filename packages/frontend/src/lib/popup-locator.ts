import type { ViewportCoord } from "./viewport-coord";

export function locatePulldown(
  anchor: HTMLElement | SVGSVGElement,
  ele: HTMLElement
): [number, number] {
  ele.style.left = "100px";
  ele.style.top = "200px";
  const anchorRect = anchor.getBoundingClientRect();
  const eleRect = ele.getBoundingClientRect();
  const win = document.documentElement;
  let dx: number = 0;
  let dy: number = 0;
  function setLeft(left: number): void {
    ele.style.left = window.scrollX + anchorRect.left + left + "px";
  }
  function setTop(top: number): void {
    ele.style.top = window.scrollY + anchorRect.top + top + "px";
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
  const finalRect = ele.getBoundingClientRect();
  return [
    finalRect.x - anchorRect.x,
    finalRect.y - anchorRect.y
  ]
}

export function syncLocation(anchor: HTMLElement | SVGSVGElement, menu: HTMLElement,
  dx: number, dy: number): void {
  const anchorRect = anchor.getBoundingClientRect();
  menu.style.left = window.scrollX + anchorRect.x + dx + "px";
  menu.style.top = window.scrollY + anchorRect.y + dy + "px";
}

export function locateContextMenu(
  anchor: ViewportCoord,
  ele: HTMLElement
): void {
  const {x, y} = anchor;
  const eleRect = ele.getBoundingClientRect();
  const win = document.documentElement;
  function setLeft(left: number): void {
    ele.style.left = left + "px";
  }
  function setTop(top: number): void {
    ele.style.top = top + "px";
  }
  if (x + eleRect.width > win.clientWidth - 4) {
    setLeft(x - eleRect.width);
  } else {
    setLeft(0);
  }
  if( y + eleRect.height > win.clientHeight - 4 ){
    setTop(-eleRect.height - 4);
  } else {
    setTop(4);
  }
}

// export function locateAtAnchor(
//   e: HTMLElement,
//   anchor: HTMLElement | SVGSVGElement
// ): void {
//   if (e != null && anchor != null) {
//     const r = anchor.getBoundingClientRect();
//     const t = e.getBoundingClientRect();
//     const w = document.documentElement.clientWidth;
//     {
//       e.style.left = "0px";
//       const tt = e.getBoundingClientRect();
//       e.style.width = tt.width + "px";
//     }
//     if (r.left + t.width > w) {
//       e.style.left = window.scrollX + w - t.width - 10 + "px";
//     } else {
//       e.style.left = window.scrollX + r.left + "px";
//     }
//     const h = document.documentElement.clientHeight;
//     if (r.top + t.height > h) {
//       e.style.top = window.scrollY + h - t.height - 10 + "px";
//     } else {
//       e.style.top = window.scrollY + r.top + r.height + 4 + "px";
//     }
//   }
// }

// export function locateAtPoint(e: HTMLElement, anchor: AbsoluteCoord): void {
//   console.log("locateAtPoint");
//   let { x, y } = anchor;
//   x -= window.scrollX;
//   y -= window.scrollY;
//   const t = e.getBoundingClientRect();
//   const w = document.documentElement.clientWidth;
//   {
//     e.style.left = "0px";
//     const tt = e.getBoundingClientRect();
//     e.style.width = tt.width + "px";
//   }
//   if (x + t.width > w) {
//     e.style.left = window.scrollX + w - t.width - 10 + "px";
//   } else {
//     e.style.left = window.scrollX + x + 4 + "px";
//   }
//   const h = document.documentElement.clientHeight;
//   if (y + t.height > h) {
//     e.style.top = window.scrollY + h - t.height - 10 + "px";
//   } else {
//     e.style.top = window.scrollY + y + 4 + "px";
//   }
// }
