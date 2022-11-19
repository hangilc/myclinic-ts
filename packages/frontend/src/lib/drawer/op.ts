export class OpBase {
  constructor(public opCode: string) {}
}

export class OpMoveTo extends OpBase {
  constructor(public x: number, public y: number) {
    super("move_to");
  }
}

// export type OpMoveTo = ["move_to", number, number];

// export function opMoveTo(x: number, y: number): OpMoveTo {
//   return ["move_to", x, y];
// }

// export type OpLineTo = ["line_to", number, number];

// export function opLineTo(x: number, y: number): OpLineTo {
//   return ["line_to", x, y];
// }

export class OpLineTo extends OpBase {
  constructor(public x: number, public y: number) {
    super("line_to");
  }
}

// export type OpCreateFont = [
//   "create_font",
//   string,
//   string,
//   number,
//   number,
//   boolean
// ];

// export function opCreateFont(
//   name: string,
//   fontName: string,
//   size: number,
//   weight: number,
//   italic: boolean
// ): OpCreateFont {
//   return ["create_font", name, fontName, size, weight, italic];
// }

export class OpCreateFont extends OpBase {
  constructor(
    public name: string,
    public fontName: string,
    public size: number,
    public weight: number,
    public italic: boolean
  ) {
    super("create_font");
  }
}

// export type OpSetFont = ["set_font", string];

export class OpSetFont extends OpBase {
  constructor(public name: string) {
    super("set_font");
  }
}

// export type OpSetTextColor = ["set_text_color", number, number, number];

export class OpSetTextColor extends OpBase {
  constructor(public r: number, public g: number, public b: number) {
    super("set_text_color");
  }
}

// export type OpDrawChars = ["draw_chars", string, number[], number[]];

export class OpDrawChars extends OpBase {
  constructor(public chars: string, public xs: number[], public ys: number[]) {
    super("draw_chars");
  }
}

// export type OpCreatePen = [
//   "create_pen",
//   string,
//   number,
//   number,
//   number,
//   number,
//   number[]
// ];

export class OpCreatePen extends OpBase {
  constructor(
    public name: string,
    public r: number,
    public g: number,
    public b: number,
    public width: number,
    public penstyle: number[]
  ) {
    super("create_pen");
  }
}

// export type OpSetPen = ["set_pen", string];

export class OpSetPen extends OpBase {
  constructor(public name: string) {
    super("set_pen");
  }
}

// export type OpCircle = ["circle", number, number, number];

export class OpCircle extends OpBase {
  constructor(public x: number, public y: number, public r: number) {
    super("circle");
  }
}

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

function castNumber(arg: any): number {
  if (typeof arg === "number") {
    return arg;
  } else {
    throw new Error("Number expected but got: " + arg);
  }
}

function castString(arg: any): string {
  if (typeof arg === "string") {
    return arg;
  } else {
    throw new Error("String expected but got: " + arg);
  }
}

function castBoolean(arg: any): boolean {
  if (typeof arg === "boolean") {
    return arg;
  } else {
    throw new Error("Boolean expected but got: " + arg);
  }
}

export function castOp(arg: any): Op {
  switch (arg[0]) {
    case "move_to":
      return new OpMoveTo(castNumber(arg[1]), castNumber(arg[2]));
    case "line_to":
      return new OpLineTo(castNumber(arg[1]), castNumber(arg[2]));
    case "create_pen":
      return new OpCreatePen(
        castString(arg[1]),
        castNumber(arg[2]),
        castNumber(arg[3]),
        castNumber(arg[4]),
        castNumber(arg[5]),
        arg[6].map(castNumber)
      );
    case "set_pen":
      return new OpSetPen(castString(arg[1]));
    case "create_font":
      return new OpCreateFont(
        castString(arg[1]),
        castString(arg[2]),
        castNumber(arg[3]),
        castNumber(arg[4]),
        castBoolean(arg[5])
      );

    case "set_font":
      return new OpSetFont(castString(arg[1]));

    case "set_text_color":
      return new OpSetTextColor(
        castNumber(arg[1]),
        castNumber(arg[2]),
        castNumber(arg[3])
      );

    case "draw_chars":
      return new OpDrawChars(
        castString(arg[1]),
        arg[2].map(castNumber),
        arg[3].map(castNumber)
      );

    case "circle":
      return new OpCircle(
        castNumber(arg[1]),
        castNumber(arg[2]),
        castNumber(arg[3])
      );

    default:
      throw new Error("unknown drawer op: " + arg);
  }
}
