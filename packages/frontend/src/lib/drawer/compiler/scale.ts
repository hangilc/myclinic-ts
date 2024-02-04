import type { Op } from "./op";

export function scaleOp(op: Op, scale: number): Op {
  switch (op[0]) {
    case "move_to": {
      const x = op[1];
      const y = op[2];
      return ["move_to", x * scale, y * scale];
    }
    case "line_to": {
      const x = op[1];
      const y = op[2];
      return ["line_to", x * scale, y * scale];
    }
    case "create_font": {
      const name = op[1];
      const fontName = op[2];
      const size = op[3];
      const weight = op[4];
      const italic = op[5];
      return ["create_font", name, fontName, size * scale, weight, italic];
    }
    case "draw_chars": {
      const text = op[1];
      const xs = op[2];
      const ys = op[3];
      return ["draw_chars", text, xs.map(x => x * scale), ys.map(y => y * scale)];
    }
    case "create_pen": {
      const name = op[1];
      const r = op[2];
      const g = op[3];
      const b = op[4];
      const width = op[5];
      const penStyle = op[6];
      return ["create_pen", name, r, g, b, width * scale, penStyle.map(s => s * scale)];
    }
    case "circle": {
      const x = op[1];
      const y = op[2];
      const r = op[3];
      return ["circle", x * scale, y * scale, r * scale];
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