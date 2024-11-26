import type { Box } from "../../compiler/box";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import * as r from "../../compiler/render";
import type { DrawerContext } from "../../compiler/context";
import type { RyouyouKeikakushoData } from "./ryouyou-keikakusho-data";
import { textBlock, type LineItemSpec } from "../../compiler/render";
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
        c.circle(ctx, b.cx(box), b.cy(box), 3);
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
    gap(1.5),
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
