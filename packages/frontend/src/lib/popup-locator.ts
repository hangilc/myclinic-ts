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
  // let dx: number = 0;
  // let dy: number = 0;
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
  if (anchorRect.bottom + eleRect.height > win.clientHeight - 4) {
    setTop(-eleRect.height - 4);
  } else {
    setTop(anchorRect.height + 4);
  }
  const finalRect = ele.getBoundingClientRect();
  return [finalRect.x - anchorRect.x, finalRect.y - anchorRect.y];
}

export function syncLocation(
  anchor: HTMLElement | SVGSVGElement,
  menu: HTMLElement,
  dx: number,
  dy: number
): void {
  const anchorRect = anchor.getBoundingClientRect();
  menu.style.left = window.scrollX + anchorRect.x + dx + "px";
  menu.style.top = window.scrollY + anchorRect.y + dy + "px";
}

export function locateContextMenu(
  anchor: HTMLElement | SVGSVGElement,
  ele: HTMLElement,
  clickLocation: ViewportCoord
): [number, number] {
  const { x, y } = clickLocation;
  const anchorRect = anchor.getBoundingClientRect();
  let [dx, dy] = [x - anchorRect.x + 4, y - anchorRect.y + 4];
  const eleRect = ele.getBoundingClientRect();
  const win = document.documentElement;

  function setLeft(dx: number): void {
    ele.style.left = window.scrollX + anchorRect.x + dx + "px";
  }
  function setTop(dy: number): void {
    ele.style.top = window.scrollY + anchorRect.y + dy + "px";
  }

  if( anchorRect.x + dx + eleRect.width > win.clientWidth ){
    dx = - eleRect.width - 4;
  }
  if( anchorRect.y + dy + eleRect.height > win.clientHeight ){
    dy = - eleRect.height - 4;
  }
  setLeft(dx);
  setTop(dy);
  return [dx, dy];
}
