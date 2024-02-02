import type { Op } from "./compiler/op";

interface Pen {
  width: string;
  color: string;
  penstyle: string;
}

interface Font {
  font_name: string;
  font_size: number;
  font_weight: number;
  font_italic: boolean;
}

export function drawerToSvg(ops: Op[], options: any) {
  options = options || {};

  let ns = "http://www.w3.org/2000/svg";
  let pen_color = "rgb(0,0,0)";
  let pen_width = "1px";
  let pen_style = "";
  let pen_dict: Record<string, Pen> = {};
  let font_name: string,
    font_size: number,
    font_weight: number,
    font_italic: boolean;
  let font_dict: Record<string, Font> = {};
  let text_color = "rgb(0,0,0)";
  let i: number, n: number, op: Op;
  let curr_x: number, curr_y: number;

  let svg = document.createElementNS(ns, "svg");
  ["width", "height", "viewBox"].forEach(function (key) {
    if (key in options) {
      svg.setAttributeNS(null, key, options[key]);
    }
  });

  function draw_move_to(x: number, y: number) {
    curr_x = x;
    curr_y = y;
  }

  function draw_line_to(x: number, y: number) {
    let e = document.createElementNS(ns, "line");
    e.setAttributeNS(null, "x1", curr_x.toString());
    e.setAttributeNS(null, "y1", curr_y.toString());
    e.setAttributeNS(null, "x2", x.toString());
    e.setAttributeNS(null, "y2", y.toString());
    //e.setAttributeNS(null, "style", "stroke:" + pen_color + ";stroke-width:" + pen_width);
    e.setAttributeNS(null, "stroke", pen_color);
    e.setAttributeNS(null, "stroke-width", pen_width);
    if (pen_style.length > 0) {
      e.setAttributeNS(null, "stroke-dasharray", pen_style);
    }
    curr_x = x;
    curr_y = y;
    return e;
  }

  function create_pen(
    name: string,
    r: number,
    g: number,
    b: number,
    width: number,
    penstyle: number[]
  ) {
    let color = "rgb(" + r + "," + g + "," + b + ")";
    const penstyleStr = penstyle.map((n) => n.toString()).join(" ");
    pen_dict[name] = {
      width: width + "px",
      color: color,
      penstyle: penstyleStr,
    };
  }

  function set_pen(name: string) {
    let pen = pen_dict[name];
    pen_color = pen.color;
    pen_width = pen.width;
    pen_style = pen.penstyle;
  }

  function create_font(
    name: string,
    font_name: string,
    font_size: number,
    font_weight: number,
    font_italic: boolean
  ) {
    font_dict[name] = { font_name, font_size, font_weight, font_italic };
  }

  function set_font(name: string) {
    let font = font_dict[name];
    font_name = font.font_name;
    font_size = font.font_size;
    font_weight = font.font_weight;
    font_italic = font.font_italic;
  }

  function set_text_color(r: number, g: number, b: number) {
    text_color = "rgb(" + r + "," + g + "," + b + ")";
  }

  function draw_chars(chars: string, xs: number[], ys: number[]) {
    let e = document.createElementNS(ns, "text");
    let attrs: Record<string, string> = {
      fill: text_color,
      "font-family": font_name,
      "font-size": font_size.toString(),
      "font-weight": font_weight ? "bold" : "normal",
      "font-italic": font_italic ? "italic" : "normal",
      "text-anchor": "start",
      dy: ys.length ? Array(ys.length).fill("1em").join(" ") : "1em"
    };
    for (let key in attrs) {
      e.setAttributeNS(null, key, attrs[key]);
    }
    if (typeof xs === "number" || xs instanceof Number) {
      e.setAttributeNS(null, "x", xs.toString());
    } else {
      e.setAttributeNS(null, "x", xs.join(" "));
    }
    if (typeof ys === "number" || ys instanceof Number) {
      e.setAttributeNS(null, "y", ys.toString());
    } else {
      e.setAttributeNS(null, "y", ys.join(" "));
    }
    chars = chars.replace(/ /g, "&nbsp;");
    e.innerHTML = chars;
    return e;
  }

  function draw_circle(cx: number, cy: number, r: number) {
    let e = document.createElementNS(ns, "circle");
    e.setAttributeNS(null, "cx", cx.toString());
    e.setAttributeNS(null, "cy", cy.toString());
    e.setAttributeNS(null, "r", r.toString());
    e.setAttributeNS(null, "style", "fill: none");
    e.setAttributeNS(null, "stroke", pen_color);
    e.setAttributeNS(null, "stroke-width", pen_width);
    if (pen_style.length > 0) {
      e.setAttributeNS(null, "stroke-dasharray", pen_style);
    }
    return e;
  }

  for (i = 0, n = ops.length; i < n; i++) {
    op = ops[i];
    switch (op[0]) {
      case "move_to": {
        draw_move_to(op[1], op[2]);
        break;
      }
      case "line_to": {
        svg.appendChild(draw_line_to(op[1], op[2]));
        break;
      }
      case "create_pen": {
        create_pen(op[1], op[2], op[3], op[4], op[5], op[6]);
        break;
      }
      case "set_pen": {
        set_pen(op[1]);
        break;
      }
      case "create_font": {
        create_font(op[1], op[2], op[3], op[4], op[5]);
        break;
      }
      case "set_font": {
        set_font(op[1]);
        break;
      }
      case "set_text_color": {
        set_text_color(op[1], op[2], op[3]);
        break;
      }
      case "draw_chars": {
        svg.appendChild(draw_chars(op[1], op[2], op[3]));
        break;
      }
      case "circle": {
        svg.appendChild(draw_circle(op[1], op[2], op[3]));
        break;
      }
      default: {
        console.error("Unknown drawer op: " + op);
      }
    }
  }
  return svg;
}
