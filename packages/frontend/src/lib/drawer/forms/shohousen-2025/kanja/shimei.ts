import type { Box } from "@/lib/drawer/compiler/box";
import * as b from "@/lib/drawer/compiler/box";
import * as c from "@/lib/drawer/compiler/compiler";
import { type DrawerContext } from "@/lib/drawer/compiler/context";
import type { ShohousenData2025 } from "../data2025";
import { black } from "../helper";
import { breakLines } from "@/lib/drawer/compiler/break-lines";

export function drawShimei(
  ctx: DrawerContext,  frame: Box, leftWidth: number, data: ShohousenData2025
) {
  let [label, body] = b.splitToColumns(frame, b.splitAt(leftWidth));
  c.frameRight(ctx, label);
  c.drawText(ctx, "氏　名", label, "center", "center");
  let shimei: string | undefined = data.shimei;
  shimei = "診療太郎"
  drawBody(ctx, body, shimei);
}

function drawBody(ctx: DrawerContext, frame: Box, shimei: string | undefined ){
  if( shimei === undefined || shimei.trim() === "" ){
    return;
  }
  let fonts = ["d5", "d4", "d3", "d2.5"];
  for(let font of fonts){
    let done = false;
    c.withTextColor(ctx, black, () => {
      let w = c.textWidthWithFont(ctx, shimei, font);
      if( w + 2 <= b.width(frame) ){
        c.withFont(ctx, font, () => {
          c.drawText(ctx, shimei, frame, "center", "center");
        });
        console.log("font", font);
        done = true;
      }
    });
    if( done ){
      return;
    }
  }
  c.withTextColor(ctx, black, () => {
    c.withFont(ctx, "d2.5", () => {
      let fontSize = c.currentFontSize(ctx);
      let texts = breakLines(shimei, fontSize, b.width(frame));
      c.drawTexts(ctx, texts, frame, { halign: "left", valign: "center" })
    });
  })
}
