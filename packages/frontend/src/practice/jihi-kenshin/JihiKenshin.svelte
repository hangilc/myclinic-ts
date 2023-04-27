<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import { Box } from "@/lib/drawer-compiler/box";
  import { DrawerCompiler } from "@/lib/drawer-compiler/drawer-compiler";
  import { HorizAlign, HorizDirection } from "@/lib/drawer-compiler/enums";
  import { A4 } from "@/lib/drawer-compiler/paper-size";
  import DrawerDialog2 from "@/lib/drawer/DrawerDialog2.svelte";
  import type { Op } from "@/lib/drawer/op";

  export let isVisible: boolean;
  const firstColWidth = 22;
  const secondColWidth = 54;

  function compileShimei(c: DrawerCompiler, row: Box): void {
    const cols = row.splitToCols(firstColWidth, secondColWidth, 17, 42, 17);
    cols.forEach((col) => c.frame(col));
    c.text(cols[0], "氏名", { interCharsSpace: 4 });
    c.addMark("氏名", cols[1]);
    c.text(cols[2], "生年月日", { halign: HorizAlign.Justify });
    c.addMark("生年月日", cols[3]);
    c.text(cols[4], "性別");
    c.addMark("性別", cols[5]);
  }

  function compileJuusho(c: DrawerCompiler, row: Box): void {
    const cols = row.splitToCols(firstColWidth);
    cols.forEach((col) => c.frame(col));
    c.text(cols[0], "住所", { interCharsSpace: 4 });
    c.addMark("住所", cols[1]);
  }

  function compileShincho(c: DrawerCompiler, row: Box): void {
    const cols = row.splitToCols(firstColWidth);
    cols.forEach((col) => c.frame(col));
    c.text(cols[0], "身長", { interCharsSpace: 4 });
    c.addMark("身長", cols[1]);
  }

  function compileTaijuu(c: DrawerCompiler, row: Box): void {
    const cols = row.splitToCols(firstColWidth);
    cols.forEach((col) => c.frame(col));
    c.text(cols[0], "体重", { interCharsSpace: 4 });
    c.addMark("体重", cols[1]);
  }

  function compileShinsatsu(c: DrawerCompiler, row: Box): void {
    const cols = row.splitToCols(firstColWidth);
    cols.forEach((col) => c.frame(col));
    c.text(cols[0], "診察", { interCharsSpace: 4 });
    c.addMark("診察", cols[1]);
  }

  function compileShiryoku(c: DrawerCompiler, row: Box): void {
    const cols = row.splitToCols(firstColWidth);
    cols.forEach((col) => c.frame(col));
    c.text(cols[0], "視力", { interCharsSpace: 4 });
    c.addMark("視力", cols[1]);
  }

  function compileChouryoku(c: DrawerCompiler, row: Box): void {
    const cols = row.splitToCols(firstColWidth);
    cols.forEach((col) => c.frame(col));
    c.text(cols[0], "聴力", { interCharsSpace: 4 });
    c.addMark("聴力", cols[1]);
  }

  function compileKetsuatsu(c: DrawerCompiler, row: Box): void {
    const cols = row.splitToCols(firstColWidth);
    cols.forEach((col) => c.frame(col));
    c.text(cols[0], "血圧", { interCharsSpace: 4 });
    c.addMark("血圧", cols[1]);
  }

  function compileShindenzu(c: DrawerCompiler, row: Box): void {
    const cols = row.splitToCols(firstColWidth);
    cols.forEach((col) => c.frame(col));
    c.text(cols[0], "心電図");
    c.addMark("心電図", cols[1]);
  }

  function compileKioureki(c: DrawerCompiler, row: Box): void {
    c.frame(row);
  }

  function compileXp(c: DrawerCompiler, row: Box): void {
    c.frame(row);
  }

  function compileKensa(c: DrawerCompiler, box: Box): void {
    const cols = box.splitToCols(firstColWidth, 90);
    c.frame(cols[0]);
    c.text(cols[0], "血液検査");
    const rows = cols[1].splitToEvenRows(9);
    rows.forEach((r, i) => {
      const cs = r.splitToCols(37);
      cs.forEach((col) => c.frame(col));
      c.addMark(`血液検査名${i + 1}`, cs[0]);
      c.addMark(`血液検査結果${i + 1}`, cs[1]);
    });
    compileKennyou(
      c,
      Box.combineRows(
        rows
          .slice(0, 3)
          .map((r) =>
            r.flipRight().setWidth(cols[2].width, HorizDirection.Left)
          )
      )
    );
  }

  function compileKennyou(c: DrawerCompiler, box: Box): void {
    c.frame(box);
    const cols = box.splitToCols(7);
    c.frame(cols[0]);
    const rows = cols[1].splitToEvenRows(3);
    rows.forEach(r => c.frame(r));
  }

  function compileBottom(c: DrawerCompiler, row: Box): void {
    c.frame(row);
  }

  function compileOps(): Op[] {
    const comp = new DrawerCompiler();
    const paper: Box = Box.fromPaperSize(A4);
    comp.createFont("regular", "serif", 4);
    comp.setFont("regular");
    const frame = paper.inset(16, 42, 26, 42);
    comp.frame(frame);
    const rows = frame.splitToRows(...Array(9).fill(9), 9 * 9);
    compileShimei(comp, rows[0]);
    compileJuusho(comp, rows[1]);
    compileShincho(
      comp,
      rows[2].setWidth(firstColWidth + secondColWidth, HorizDirection.Left)
    );
    compileTaijuu(
      comp,
      rows[3].setWidth(firstColWidth + secondColWidth, HorizDirection.Left)
    );
    compileShinsatsu(
      comp,
      rows[4].setWidth(firstColWidth + secondColWidth, HorizDirection.Left)
    );
    compileShiryoku(
      comp,
      rows[5].setWidth(firstColWidth + secondColWidth, HorizDirection.Left)
    );
    compileChouryoku(
      comp,
      rows[6].setWidth(firstColWidth + secondColWidth, HorizDirection.Left)
    );
    compileKetsuatsu(
      comp,
      rows[7].setWidth(firstColWidth + secondColWidth, HorizDirection.Left)
    );
    compileShindenzu(
      comp,
      rows[8].setWidth(firstColWidth + secondColWidth, HorizDirection.Left)
    );
    compileKioureki(
      comp,
      Box.combineRows(
        rows
          .slice(2, 4)
          .map((row) => row.inset(firstColWidth + secondColWidth, 0, 0, 0))
      )
    );
    compileXp(
      comp,
      Box.combineRows(
        rows
          .slice(4, 9)
          .map((row) => row.inset(firstColWidth + secondColWidth, 0, 0, 0))
      )
    );
    compileKensa(comp, rows[9]);
    compileBottom(comp, rows[10]);
    return comp.compile();
  }

  function doDisplay() {
    const d: DrawerDialog2 = new DrawerDialog2({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "自費健診印刷",
        ops: compileOps(),
        width: A4[0],
        height: A4[1],
        previewScale: 2,
      },
    });
  }
</script>

<div style:display={isVisible ? "block" : "none"}>
  <ServiceHeader title="自費健診" />
  <div>
    <button on:click={doDisplay}>表示</button>
  </div>
</div>

<style>
</style>
