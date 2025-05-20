import type { Box } from "@/lib/drawer/compiler/box";
import * as b from "@/lib/drawer/compiler/box";
import * as c from "@/lib/drawer/compiler/compiler";
import * as x from "../xsplit";
import * as r from "../row-renderer";
import { type DrawerContext } from "@/lib/drawer/compiler/context";
import type { ShohousenData2025 } from "../data2025";
import { nenMonthDayRenderer } from "../helper";
import { DateWrapper } from "myclinic-util";

export function drawBirthdayAndSex(
  ctx: DrawerContext,  frame: Box, leftWidth: number, data: ShohousenData2025
) {
  const [label, birthday, sex] = b.splitToColumns(frame, x.split(
    x.fixed(leftWidth), x.gap(), x.fixed(10)
  ))
  c.frameRight(ctx, label);
  c.frameRight(ctx, birthday);
  c.drawText(ctx, "生年月日", label, "center", "center");
  drawBirthday(ctx, birthday, data);
  drawSex(ctx, sex, data);
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
  if( birthday ){
    let geng = birthday.getGengou().charAt(0);
    switch(geng){
      case "明": {
        
      }
      case "大": {
        
      }
      case "昭": {
        
      }
      case "平": {
        
      }
      case "令": {
        
      }
    }
  }
  nenMonthDayRenderer(
    ctx,
    b.modify(body, b.inset(0, 0, 3, 0)),
    birthday,
  )
}

function drawSex(ctx: DrawerContext, frame: Box, data: ShohousenData2025) {
  let sex = data.sex;
  r.renderRow(ctx, frame,
    r.gap(),
    r.t("男", { render: sex === "M" ? circleDecorator(1.5) : undefined }),
    r.t("・"),
    r.t("女", { render: sex === "F" ? circleDecorator(1.5) : undefined }),
    r.gap(),
  )
}

function circleDecorator(
  radius: number
): (ctx: DrawerContext, box: Box, orig: (ctx: DrawerContext, box: Box) => void) => void  {
  return (ctx, box, orig) => {
    orig(ctx, box);
    c.withPen(ctx, "data-thin", () => {
      c.circle(ctx, b.cx(box), b.cy(box), radius);
    })
  }
}
