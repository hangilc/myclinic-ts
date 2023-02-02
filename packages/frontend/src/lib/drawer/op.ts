export class OpBase {
  constructor(public opCode: string) {}
}

export class OpMoveTo extends OpBase {
  constructor(public x: number, public y: number) {
    super("move_to");
  }

  toJSON(): any {
    return [this.opCode, this.x, this.y];
  }
}

export class OpLineTo extends OpBase {
  constructor(public x: number, public y: number) {
    super("line_to");
  }

  toJSON(): any {
    return [this.opCode, this.x, this.y]
  }
}

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

  toJSON(): any {
    return [this.opCode, this.name, this.fontName, this.size, this.weight, 
      this.italic ? 1 : 0]
  }
}

export class OpSetFont extends OpBase {
  constructor(public name: string) {
    super("set_font");
  }

  toJSON(): any {
    return [this.opCode, this.name]
  }
}

export class OpSetTextColor extends OpBase {
  constructor(public r: number, public g: number, public b: number) {
    super("set_text_color");
  }

  toJSON(): any {
    return [this.opCode, this.r, this.g, this.b];
  }
}

export class OpDrawChars extends OpBase {
  constructor(public chars: string, public xs: number[], public ys: number[]) {
    super("draw_chars");
  }

  toJSON(): any {
    return [this.opCode, this.chars, this.xs, this.ys]
  }
}

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

  toJSON(): any {
    return [this.opCode, this.name, this.r, this.g, this.b, this.width, this.penstyle]
  }
}

export class OpSetPen extends OpBase {
  constructor(public name: string) {
    super("set_pen");
  }

  toJSON(): any {
    return [this.opCode, this.name]
  }
}

export class OpCircle extends OpBase {
  constructor(public x: number, public y: number, public r: number) {
    super("circle");
  }

  toJSON(): any {
    return [this.opCode, this.x, this.y, this.r]
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
        castNumber(arg[5]) === 0 ? false : true
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
