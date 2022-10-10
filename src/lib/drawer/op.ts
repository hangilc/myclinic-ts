export interface OpMoveTo {
  x: number;
  y: number;
};

export interface OpLineTo {
  x: number;
  y: number;
};

export interface OpCreateFont {
  name: string;
  fontName: string;
  size: number;
  weight: number;
  italic: boolean;
}

export interface OpSetFont {
  name: string;
}

export interface OpSetTextColor {
  r: number;
  g: number;
  b: number;
}

export interface OpDrawChars {
  chars: string;
  xs: number[];
  ys: number[];
}

export interface OpCreatePen {
  name: string,
  r: number,
  g: number,
  b: number,
  width: number,
  penStyle: number[];
}

export interface OpSetPen {
  name: string;
}

export interface OpCircle {
  cx: number;
  cy: number;
  r: number;
}

export type Op = OpMoveTo | OpLineTo | OpCreateFont | OpSetFont |
  OpSetTextColor | OpDrawChars | OpCreatePen | OpSetPen | OpCircle;


