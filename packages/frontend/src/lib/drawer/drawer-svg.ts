import { OpCircle, OpCreateFont, OpCreatePen, OpDrawChars, OpLineTo, OpMoveTo, OpSetFont, OpSetPen, OpSetTextColor, type Op } from "./op";

// export function drawerJsonToSvg(opsJson: string, width, height, viewBox) {
//   let ops = JSON.parse(opsJson);
//   let options = { width, height, viewBox };
//   return drawerToSvg(ops, options);
// }

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

  // function mmToPixel(dpi: number, mm: number) {
  //   let inch = mm / 25.4;
  //   return Math.floor(dpi * inch);
  // }

  // function pixelToMm(dpi: number, px: number) {
  //   let inch = px / dpi;
  //   return inch * 25.4;
  // }

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

  // function encodeText(text: string) {
  //   text = text.replace(/ /g, "&nbsp;");
  //   text = text.replace(/&/g, "&amp;");
  //   text = text.replace(/>/g, "&gt;");
  //   text = text.replace(/</g, "&lt;");
  //   text = text.replace(/"/g, "&quot;");
  //   text = text.replace(/'/g, "&#039;");
  //   return text;
  // }

  function draw_chars(chars: string, xs: number[], ys: number[]) {
    let e = document.createElementNS(ns, "text");
    let attrs: Record<string, string> = {
      fill: text_color,
      "font-family": font_name,
      "font-size": font_size.toString(),
      "font-weight": font_weight ? "bold" : "normal",
      "font-italic": font_italic ? "italic" : "normal",
      "text-anchor": "start",
      //'dominant-baseline': "text-after-edge",
      dy: "1em",
    };
    for (let key in attrs) {
      e.setAttributeNS(null, key, attrs[key]);
    }
    if (typeof xs === "number" || xs instanceof Number) {
      e.setAttributeNS(null, "x", xs.toString());
    } else {
      e.setAttributeNS(null, "x", xs.join(","));
    }
    if (typeof ys === "number" || ys instanceof Number) {
      e.setAttributeNS(null, "y", ys.toString());
    } else {
      e.setAttributeNS(null, "y", ys.join(","));
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
    if( op instanceof OpMoveTo ){
      draw_move_to(op.x, op.y);
    } else if( op instanceof OpLineTo ){
      svg.appendChild(draw_line_to(op.x, op.y));
    } else if( op instanceof OpCreatePen ){
      create_pen(op.name, op.r, op.g, op.b, op.width, op.penstyle);
    } else if( op instanceof OpSetPen ){
      set_pen(op.name);
    } else if( op instanceof OpCreateFont ){
      create_font(op.name, op.fontName, op.size, op.weight, op.italic);
    } else if( op instanceof OpSetFont ){
      set_font(op.name);
    } else if( op instanceof OpSetTextColor ){
      set_text_color(op.r, op.g, op.b);
    } else if( op instanceof OpDrawChars ){
      svg.appendChild(draw_chars(op.chars, op.xs, op.ys));
    } else if( op instanceof OpCircle ){
      svg.appendChild(draw_circle(op.x, op.y, op.r));
    } else {
      console.error("Unknown drawer op: " + op);
    }
  }
  return svg;
}
