<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import { Box } from "@/lib/drawer-compiler/box";
  import { DrawerCompiler } from "@/lib/drawer-compiler/drawer-compiler";
  import { A4 } from "@/lib/drawer-compiler/paper-size";
  import DrawerDialog2 from "@/lib/drawer/DrawerDialog2.svelte";
  import type { Op } from "@/lib/drawer/op";

  export let isVisible: boolean;
  const firstColWidth = 22;
  const secondColWidth = 54;

  function compileShimei(c: DrawerCompiler, row: Box): void {
    const cols = row.splitToColsAt(firstColWidth, )
  }

  function compileOps(): Op[] {
    const comp = new DrawerCompiler();
    const paper: Box = Box.fromPaperSize(A4);
    const frame = paper.insert(16, 42, 26, 42);
    comp.box(frame);
    const rows = frame.splitToRowsAt(...Array(9).fill(9), 9*9);
    rows.forEach(r => comp.box(r));
    compileShimei(comp, rows[0]);
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
      }
    })
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
