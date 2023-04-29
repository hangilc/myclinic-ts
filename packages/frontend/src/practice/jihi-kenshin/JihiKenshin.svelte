<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import DrawerDialog2 from "@/lib/drawer/DrawerDialog2.svelte";
  import { A4 } from "@/lib/drawer-compiler/paper-size";
  import { createJihiKenshinCompiler } from "./jihi-kenshin-compiler";
  import { HorizAlign, VertAlign } from "@/lib/drawer-compiler/enums";
  import EditableDate from "@/lib/editable-date/EditableDate.svelte";
  import * as kanjidate from "kanjidate";
  import type { DrawerCompiler } from "@/lib/drawer-compiler/drawer-compiler";
  import type { TextVariant } from "@/lib/drawer-compiler/text-variant";

  export let isVisible: boolean;
  let name: string = "田中　元";
  let birthdate: Date | null = new Date(1945, 3, 6);
  let sex: string = "男性";
  let address: string = "東京０３";
  let height: string = "";
  let weight: string = "";
  let visualAcuityLeft: string = "";
  let visualAcuityLeftCorrected: string = "";
  let visualAcuityRight: string = "";
  let visualAcuityRightCorrected: string = "";
  let hearingExamConducted: string = "未実施";
  let hearingLeft1000Loss: string = "なし";
  let hearingLeft4000Loss: string = "なし";
  let hearingRight1000Loss: string = "なし";
  let hearingRight4000Loss: string = "なし";
  let bloodPressure: string = "";
  let shindenzu: string = "";

  function hasNoVisualAcuityInput(): boolean {
    return (
      visualAcuityLeft.trim() === "" &&
      visualAcuityLeftCorrected.trim() === "" &&
      visualAcuityRight.trim() === "" &&
      visualAcuityRightCorrected.trim() === ""
    );
  }

  function set(
    c: DrawerCompiler,
    name: string,
    value: string | (string | TextVariant)[]
  ): void {
    c.text(c.getMark(name).shrinkToRight(2), value, {
      valign: VertAlign.Center,
    });
  }

  function doDisplay() {
    const comp = createJihiKenshinCompiler();
    comp.setFont("entry");
    set(comp, "氏名", name);
    if (birthdate) {
      set(comp, "生年月日", kanjidate.format(kanjidate.f2, birthdate));
    }
    set(comp, "性別", sex);
    set(comp, "住所", address);
    set(comp, "身長", [height || comp.space(18), " cm"]);
    set(comp, "体重", [weight || comp.space(18), " kg"]);
    if (hasNoVisualAcuityInput()) {
      const b = comp.getMark("視力");
      comp.line(...b.leftBottom(), ...b.rightTop());
    } else {
      const lts = ["左", comp.space(1), visualAcuityLeft || comp.space(8)];
      if (visualAcuityLeftCorrected) {
        lts.push(comp.space(1), "(", visualAcuityLeftCorrected, ")");
      }
      set(comp, "視力左", lts);
      const rts = ["右", comp.space(1), visualAcuityRight || comp.space(8)];
      if (visualAcuityRightCorrected) {
        rts.push(comp.space(1), "(", visualAcuityRightCorrected, ")");
      }
      set(comp, "視力右", rts);
    }
    if( hearingExamConducted === "実施" ){
      const b = comp.getMark("聴力");
      let [left, right] = b.splitToEvenCols(2);
      left = comp.textAndAdvance(left.insetLeft(1), "左", { valign: VertAlign.Center });
      let [top, bottom] = left.insetLeft(0.5).splitToEvenRows(2);
      let saveFont = comp.setFont("small-entry");
      comp.text(top, "4000Hz 所見" + hearingLeft4000Loss, { valign: VertAlign.Center });
      comp.text(bottom, "1000Hz 所見" + hearingLeft1000Loss, { valign: VertAlign.Center });
      comp.setFont(saveFont);
      right = comp.textAndAdvance(right.insetLeft(1), "右", { valign: VertAlign.Center });
      [top, bottom] = right.insetLeft(0.5).splitToEvenRows(2);
      saveFont = comp.setFont("small-entry");
      comp.text(top, "4000Hz 所見" + hearingRight4000Loss, { valign: VertAlign.Center });
      comp.text(bottom, "1000Hz 所見" + hearingRight1000Loss, { valign: VertAlign.Center });
      comp.setFont(saveFont);
    } else {
      const b = comp.getMark("聴力");
      comp.line(...b.leftBottom(), ...b.rightTop());
    }
    set(comp, "血圧", bloodPressure);
    set(comp, "心電図", shindenzu);
    comp.labelMarks();
    const d: DrawerDialog2 = new DrawerDialog2({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "自費健診印刷",
        ops: comp.ops,
        width: A4[0],
        height: A4[1],
        previewScale: 2,
        displayWidth: A4[0] * 2 + 20,
        displayHeight: A4[1] * 2 + 20,
      },
    });
  }
</script>

<div style:display={isVisible ? "block" : "none"}>
  <ServiceHeader title="自費健診" />
  <h3>患者情報</h3>
  <div class="input-panel">
    <span>氏名</span>
    <input type="text" bind:value={name} />
    <span>生年月日</span>
    <EditableDate bind:date={birthdate} />
    <span>住所</span>
    <input type="text" bind:value={address} />
    <span>性別</span>
    <form>
      <input type="radio" bind:group={sex} value="男性" /> 男
      <input type="radio" bind:group={sex} value="女性" /> 女
    </form>
  </div>
  <h3>身体所見等</h3>
  <div class="input-panel">
    <span>身長</span>
    <div class="inline-block">
      <input type="text" style:width="5em" bind:value={height} /> cm
    </div>
    <span>体重</span>
    <div class="inline-block">
      <input type="text" style:width="5em" bind:value={weight} /> kg
    </div>
    <span>視力</span>
    <div class="inline-block">
      <div style="margin-bottom:3px;">
        左 <input type="text" style:width="3em" bind:value={visualAcuityLeft} />
        (
        <input
          type="text"
          style:width="3em"
          bind:value={visualAcuityLeftCorrected}
        /> )
      </div>
      <div>
        右 <input
          type="text"
          style:width="3em"
          bind:value={visualAcuityRight}
        />
        (
        <input
          type="text"
          style:width="3em"
          bind:value={visualAcuityRightCorrected}
        /> )
      </div>
    </div>
    <span>聴力</span>
    <div class="inline-block">
      <form>
        <input
          type="radio"
          name="hearing-conducted"
          bind:group={hearingExamConducted}
          value="実施"
        />
        実施
        <input
          type="radio"
          name="hearing-conducted"
          bind:group={hearingExamConducted}
          value="未実施"
        /> 未実施
      </form>
      {#if hearingExamConducted === "実施"}
        左 4000Hz 所見<select bind:value={hearingLeft4000Loss}
          ><option>なし</option><option>あり</option></select
        ><br /> 1000Hz 所見
        <select bind:value={hearingLeft1000Loss}
          ><option>なし</option><option>あり</option></select
        ><br />右 4000Hz 所見
        <select bind:value={hearingRight4000Loss}
          ><option>なし</option><option>あり</option></select
        ><br /> 1000Hz 所見
        <select bind:value={hearingRight1000Loss}
          ><option>なし</option><option>あり</option></select
        >
      {/if}
    </div>
    <span>血圧</span>
    <input type="text" bind:value={bloodPressure} />
    <span>心電図</span>
    <input type="text" bind:value={shindenzu} />
  </div>
  <div class="commands">
    <button on:click={doDisplay}>表示</button>
  </div>
</div>

<style>
  .input-panel {
    width: 300px;
    display: grid;
    grid-template-columns: auto 1fr;
    row-gap: 3px;
  }

  .input-panel > *:nth-child(odd) {
    margin-right: 4px;
  }

  .inline-block {
    display: inline-block;
  }

  .commands {
    display: flex;
    justify-content: left;
    margin: 10px;
  }
</style>
