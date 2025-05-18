import type { Box } from "@/lib/drawer/compiler/box";
import * as b from "@/lib/drawer/compiler/box";
import * as c from "@/lib/drawer/compiler/compiler";
import * as x from "../xsplit";
import { type DrawerContext } from "@/lib/drawer/compiler/context";
import type { ShohousenData2025 } from "../data2025";
import { black, nenMonthDayRenderer } from "../helper";
import { breakLines } from "@/lib/drawer/compiler/break-lines";
import { DateWrapper } from "myclinic-util";

export function drawBirthdayAndSex(
  ctx: DrawerContext,  frame: Box, leftWidth: number, data: ShohousenData2025
) {
  const [label, birthday, sex] = b.splitToColumns(frame, x.split(
    x.fixed(20), x.gap(), x.fixed(10)
  ))
  c.frameRight(ctx, label);
  c.frameRight(ctx, birthday);
  c.drawText(ctx, "生年月日", label, "center", "center");
  drawBirthday(ctx, birthday, data);
}

function drawBirthday(ctx: DrawerContext, frame: Box, data: ShohousenData2025) {
  let birthday = data.birthdate ? DateWrapper.from(data.birthdate) : undefined;
  let [geng, body] = b.splitToColumns(frame, b.splitAt(4));
  let box = b.modify(geng, b.inset(0, 0.5));
  let rows = b.splitToRows(box, b.evenSplitter(5));
  c.withFont(ctx, "f1.5", () => {
    c.drawText(ctx, "明", rows[0], "center", "center");
    c.drawText(ctx, "大", rows[1], "center", "center");
    c.drawText(ctx, "昭", rows[2], "center", "center");
    c.drawText(ctx, "平", rows[3], "center", "center");
    c.drawText(ctx, "令", rows[4], "center", "center");
  });
  nenMonthDayRenderer(
    ctx,
    b.modify(body, b.inset(0, 0, 3, 0)),
    birthday,
  )
}

