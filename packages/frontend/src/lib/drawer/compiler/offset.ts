import type { Op } from "./op";

export function offsetOp(op: Op, offsetX: number, offsetY: number): Op {
  switch (op[0]) {
    case "move_to": {
      const x = op[1];
      const y = op[2];
      return ["move_to", x + offsetX, y + offsetY];
    }
    case "line_to": {
      const x = op[1];
      const y = op[2];
      return ["line_to", x + offsetX, y + offsetY];
    }
    case "create_font": {
      return op;
    }
    case "draw_chars": {
      const text = op[1];
      const xs = op[2];
      const ys = op[3];
      return ["draw_chars", text, xs.map(x => x + offsetX), ys.map(y => y + offsetY)];
    }
    case "create_pen": {
      return op;
    }
    case "circle": {
      const x = op[1];
      const y = op[2];
      const r = op[3];
      return ["circle", x + offsetX, y + offsetY, r];
    }
    case "set_font":
    case "set_text_color": 
    case "set_pen": {
      return op;
    }
    default: {
      throw new Error(`Unknown op: ${op[0]}`);
    }
  }
}