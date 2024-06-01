import type { Box } from "../../compiler/box";
import type { CompositeGap, CompositeGapTo, CompositeItem, CompositeText } from "../../compiler/compiler";
import * as p from "../../compiler/composite-item";
import * as c from "../../compiler/compiler";
import * as b from "../../compiler/box";
import type { DrawerContext } from "../../compiler/context";

export interface Widgets {
  box(mark: string): CompositeItem;
  boxed(label: string, mark: string): CompositeItem[];
}

export function mkWidgets(): Widgets {
  const widgets = {
    box(mark: string): CompositeItem {
      return p.box({
        mark, pen: "thin", ropt: {
          render: (ctx: DrawerContext, box: Box, data: string | undefined) => {
            if (data != undefined && data !== "") {
              c.withPen(ctx, "thick", () => {
                c.moveTo(ctx, box.left, box.bottom);
                c.lineTo(ctx, box.right, box.top);
              });
            }
          }
        }
      })
    },
    boxed(label: string, mark: string): CompositeItem[] {
      return [widgets.box(mark), p.gap(0.5), p.text(label)];
    }
  }
  return widgets;
}

export function mkItems() {
  const items = Object.assign({}, p, {
    text(text: string, opt: Partial<CompositeText> = {}): CompositeText {
      if( opt.mark ){
        opt = Object.assign({
          ropt: { circle: true, pen: "thin" }
        }, opt );
        if( opt.mark === "patient-sex-male" ){
          console.log(opt);
        }
      }
      return p.text(text, opt);
    },
    gapTo(at: number, opt: Partial<CompositeGapTo> = {}): CompositeGapTo {
      if( opt.mark ){
        opt = Object.assign({
          ropt: { modifiers: [b.shrinkHoriz(1, 1)] }
        }, opt);
      }
      return p.gapTo(at, opt);
    },
    gap(width: number, opt: Partial<CompositeGap> = {}): CompositeGap {
      if( opt.mark ){
        opt = Object.assign({
          ropt: { modifiers: [b.shrinkHoriz(1, 1)] }
        }, opt);
      }
      return p.gap(width, opt);
    }
  });
  return items;
}
