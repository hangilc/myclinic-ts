// export interface OpMoveTo {
//   x: number;
//   y: number;
// };

export type OpMoveTo = ["move_to", number, number];

export function opMoveTo(x: number, y: number): OpMoveTo {
  return ["move_to", x, y];
}

// export interface OpLineTo {
//   x: number;
//   y: number;
// };

export type OpLineTo = ["line_to", number, number];

export function opLineTo(x: number, y: number): OpLineTo {
  return ["line_to", x, y];
}

// export interface OpCreateFont {
//   name: string;
//   fontName: string;
//   size: number;
//   weight: number;
//   italic: boolean;
// }

export type OpCreateFont = [
  "create_font",
  string,
  string,
  number,
  number,
  boolean
];

export function opCreateFont(
  name: string,
  fontName: string,
  size: number,
  weight: number,
  italic: boolean
): OpCreateFont {
  return ["create_font", name, fontName, size, weight, italic];
}

// export interface OpSetFont {
//   name: string;
// }

export type OpSetFont = ["set_font", string];

// export interface OpSetTextColor {
//   r: number;
//   g: number;
//   b: number;
// }

export type OpSetTextColor = ["set_text_color", number, number, number];

// export interface OpDrawChars {
//   chars: string;
//   xs: number[];
//   ys: number[];
// }

export type OpDrawChars = ["draw_chars", string, number[], number[]];

// export interface OpCreatePen {
//   name: string,
//   r: number,
//   g: number,
//   b: number,
//   width: number,
//   penStyle: number[];
// }

export type OpCreatePen = [
  "create_pen",
  string,
  number,
  number,
  number,
  number,
  number[]
];

// export interface OpSetPen {
//   name: string;
// }

export type OpSetPen = ["set_pen", string];

// export interface OpCircle {
//   cx: number;
//   cy: number;
//   r: number;
// }

export type OpCircle = ["circle", number, number, number];

export type Op =
  | OpMoveTo
  | OpLineTo
  | OpCreateFont
  | OpSetFont
  | OpSetTextColor
  | OpDrawChars
  | OpCreatePen
  | OpSetPen
  | OpCircle;
