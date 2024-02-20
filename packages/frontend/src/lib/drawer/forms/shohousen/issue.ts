import type { Box } from "../../compiler/box";
import * as b from "../../compiler/box";
import * as c from "../../compiler/compiler";
import type { DrawerContext } from "../../compiler/context";


export function drawIssue(ctx: DrawerContext,  box: Box) {
  const layout = b.withSplitColumns(box, b.splitWidths(14.5, 40.5, 14.5, 40.5), rs => {
    return { issueLabel: rs[0], issueDate: rs[1], validLabel: rs[2], validUpto: rs[3], notice: rs[4] };
  });
  c.rect(ctx, box); 
  [layout.issueLabel, layout.issueDate, layout.validLabel].forEach(box => c.frameRight(ctx, box));
  c.setFont(ctx, "mincho-2.5");
  c.drawTextJustified(ctx, "交付年月日", b.modify(layout.issueLabel, b.inset(0.5, 0)), "center");
  drawIssueDate(ctx, layout.issueDate);
  c.setFont(ctx, "mincho-2");
  b.withSplitRows(b.modify(layout.validLabel, b.inset(0.5, 0)), b.evenSplitter(2), rs => {
    c.drawTextJustified(ctx, "処方せんの", rs[0], "center");
    c.drawTextJustified(ctx, "使用期間", rs[1], "center");
  });
  drawValidUpto(ctx, layout.validUpto);
  c.setFont(ctx, "mincho-1.8");
  b.withSplitRows(b.modify(layout.notice, b.inset(1.5, 0)), b.evenSplitter(3), rs => {
    c.drawText(ctx, "特に記載のある場合を除き、", rs[0], "center", "center");
    c.drawText(ctx, "交付の日を含めて４日以内に保", rs[1], "center", "center");
    c.drawText(ctx, "険薬局に提出すること。", rs[2], "center", "center");
  });
}

function drawIssueDate(ctx: DrawerContext, box: Box) {
  c.drawComposite(ctx, box, [
    { kind: "gap-to", at: 16, mark: "issueYearBox" },
    { kind: "gap", width: 1},
    { kind: "text", text: "年"},
    { kind: "gap-to", at: 24, mark: "issueMonthBox" },
    { kind: "gap", width: 1},
    { kind: "text", text: "月"},
    { kind: "gap-to", at: 32, mark: "issueDayBox" },
    { kind: "gap", width: 1},
    { kind: "text", text: "日"},
  ]);
  // c.mark(ctx, "issueYearBox", year);
  // c.mark(ctx, "issueMonthBox", month);
  // c.mark(ctx, "issueDayBox", day);
}

function drawValidUpto(ctx: DrawerContext, box: Box) {
  c.drawComposite(ctx, box, [
    { kind: "gap-to", at: 16, mark: "validYearBox" },
    { kind: "gap", width: 1},
    { kind: "text", text: "年"},
    { kind: "gap-to", at: 24, mark: "validMonthBox" },
    { kind: "gap", width: 1},
    { kind: "text", text: "月"},
    { kind: "gap-to", at: 32, mark: "validDayBox" },
    { kind: "gap", width: 1},
    { kind: "text", text: "日"},
  ]);
  // c.mark(ctx, "validYearBox", year);
  // c.mark(ctx, "validMonthBox", month);
  // c.mark(ctx, "validDayBox", day);
}

