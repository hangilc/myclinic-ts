import { AbsoluteCoord } from "./absolute-coord";

export class ViewportCoord {
  isViewportCoord: boolean = true;
  constructor(
    public x: number,
    public y: number
  ) { }

  toAbsolute(): AbsoluteCoord {
    return new AbsoluteCoord(
      window.scrollX + this.x,
      window.scrollY + this.y
    );
  }

  static fromEvent(event: MouseEvent): ViewportCoord {
    return new ViewportCoord(event.clientX, event.clientY);
  }
}