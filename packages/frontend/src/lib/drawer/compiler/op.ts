export type OpMoveTo = ["move_to", x: number, y: number];
export type OpLineTo = ["line_to", x: number, y: number];
export type OpCreateFont = ["create_font", name: string, fontName: string, size: number, weight: number, italic: number];
export type OpSetFont = ["set_font", name: string];
export type OpSetTextColor = ["set_text_color", r: number, g: number, b: number];
export type OpDrawChars = ["draw_chars", chars: string, xs: number[], ys: number[]];
export type OpCreatePen = ["create_pen", name: string, r: number, g: number, b: number, width: number, penStyle: number[]];
export type OpSetPen = ["set_pen", name: string];
export type OpCircle = ["circle", x: number, y: number, r: number];
export type Op = OpMoveTo | OpLineTo | OpCreateFont | OpSetFont | OpSetTextColor | OpDrawChars |
  OpCreatePen | OpSetPen | OpCircle;