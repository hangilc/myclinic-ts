import type { Box } from "../../compiler/box";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import * as r from "../../compiler/render";
import type { DrawerContext } from "../../compiler/context";
import type { RyouyouKeikakushoData } from "./ryouyou-keikakusho-data";
import { textBlock, type LineItemSpec, type Block } from "../../compiler/render";
import type { HAlign } from "../../compiler/align";

export function value(data: RyouyouKeikakushoData, key: keyof RyouyouKeikakushoData): string {
  return data[key]?.toString() ?? "";
}

export function booleanValue(data: RyouyouKeikakushoData, key: keyof RyouyouKeikakushoData): boolean {
  return !!data[key];
}

export function textCircle(text: string, drawCircle: boolean): LineItemSpec {
  return textBlock(text, undefined, {
    decorate: (ctx, box) => {
      if (drawCircle) {
        c.withPen(ctx, "thin", () => {
          c.circle(ctx, b.cx(box), b.cy(box), 3);
        })
      }
    }
  });
}

export function gap(size: number, text?: string): LineItemSpec {
  return r.textBlock(text, { kind: "fixed", value: size }, { halign: "center", valign: "center" })
}

export function boxed(label: string, data: RyouyouKeikakushoData, key: keyof RyouyouKeikakushoData): LineItemSpec[] {
  let size = 3;
  function drawBox(ctx: DrawerContext, box: Box) {
    box = b.modify(box, b.setHeight(size, "center"), b.shiftDown(0.2));
    c.withPen(ctx, "thin", () => {
      c.frame(ctx, box);
      if (booleanValue(data, key)) {
        c.withPen(ctx, "thick", () => {
          c.moveTo(ctx, box.left, box.bottom);
          c.lineTo(ctx, box.right, box.top);
        });
      }
    });
  }
  return [
    {
      width: { kind: "fixed", value: size },
      calcHeight: () => size,
      render: drawBox,
    },
    gap(1.0),
    textBlock(label),
  ];
}

export function expander(text?: string): LineItemSpec {
  return r.textBlock(text, { kind: "expand" }, { halign: "center", valign: "center" });
}

export function line(ctx: DrawerContext, box: Box, extendedSpecs: (string | LineItemSpec)[], opt?: {
  halign?: HAlign
}) {
  const specs: LineItemSpec[] = extendedSpecs.map(spec => {
    if (typeof spec === "string") {
      return r.textBlock(spec, undefined, { valign: "center" });
    } else {
      return spec;
    }
  });
  const block = r.line(ctx, specs, { maxWidth: b.width(box) });
  r.putIn(ctx, block, box, { halign: opt?.halign ?? "left", valign: "center" });
}

export function drawLeftSquareBracket(ctx: DrawerContext, box: Box) {
  box = b.modify(box, b.shrinkHoriz(b.width(box) * 0.5, 0));
  c.withPen(ctx, "thin", () => {
    c.frameTop(ctx, box);
    c.frameLeft(ctx, box);
    c.frameBottom(ctx, box);
  });
}
export function drawRightSquareBracket(ctx: DrawerContext, box: Box) {
  box = b.modify(box, b.shrinkHoriz(0, b.width(box) * 0.5));
  c.withPen(ctx, "thin", () => {
    c.frameTop(ctx, box);
    c.frameRight(ctx, box);
    c.frameBottom(ctx, box);
  });
}

export function drawBracketed(ctx: DrawerContext, box: Box, text: string, opt?: {
  bracketWidth?: number;
}) {
  const calcHeight = () => b.height(box);
  const bracketWidth = opt?.bracketWidth ?? 2;
  line(ctx, box, [
    {
      width: { kind: "fixed", value: bracketWidth },
      calcHeight,
      render: (ctx, box) => drawLeftSquareBracket(ctx, box),
    },
    {
      width: { kind: "expand" },
      calcHeight,
      render: (ctx, box) => {
        c.paragraph(ctx, text, b.modify(box, b.shrinkHoriz(1, 1)));
      },
    },
    {
      width: { kind: "fixed", value: bracketWidth },
      calcHeight,
      render: (ctx, box) => drawRightSquareBracket(ctx, box),
    }
  ]);
}