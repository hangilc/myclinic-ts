<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";
  import { A4 } from "@/lib/drawer-compiler/paper-size";
  import { createJihiKenshinCompiler } from "./jihi-kenshin-compiler";
  import { HorizAlign, VertAlign } from "@/lib/drawer-compiler/enums";
  import EditableDate from "@/lib/editable-date/EditableDate.svelte";
  import * as kanjidate from "kanjidate";
  import type { DrawerCompiler } from "@/lib/drawer-compiler/drawer-compiler";
  import type { TextVariant } from "@/lib/drawer-compiler/text-variant";
  import type { Box } from "@/lib/drawer/compiler/box";
  import api from "@/lib/api";
  import SelectPatientBySearch from "../exam/select-patient-dialogs/SelectPatientBySearch.svelte";
  import TextInputDialog from "./TextInputDialog.svelte";
  import { encodeUrineResult } from "./urine-exam";
  import { convLine } from "./conv-line";
  import * as c from "@/lib/drawer/compiler/compiler";
  import * as b from "@/lib/drawer/compiler/box";
  import type { DrawerContext } from "@/lib/drawer/compiler/context";
  import type { CompositeItem } from "@/lib/drawer/compiler/compiler";

  export let isVisible: boolean;
  let name: string = "";
  let birthdate: Date | null = null;
  let sex: string = "男性";
  let address: string = "";
  let height: string = "";
  let weight: string = "";
  let physicalExam: string = "異常なし";
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
  let kioureki: string = "";
  let xp: string = "";
  let xpConductedDate: Date | null = null;
  let kensaLabels: string[] = [
    "赤血球数",
    "血色素量",
    "ヘマトクリット",
    "GOT",
    "GPT",
    "γGTP",
    "クレアチニン",
    "血糖値",
    "HbA1c",
  ];
  let kensaValues: string[] = Array(9).fill("");
  let urineProtein: string = "";
  let urineBlood: string = "";
  let urineGlucose: string = "";
  let tokkijikou: string = "";
  let issueDate: Date = new Date();
  let address1 = "";
  let address2 = "";
  let clinicName = "";
  let doctorName = "";
  let showMarker: boolean = false;

  applyClinicInfo();

  async function applyClinicInfo() {
    const ci = await api.getClinicInfo();
    address1 = `${ci.postalCode} ${ci.address}`;
    address2 = `TEL ${ci.tel} FAX ${ci.fax}`;
    clinicName = ci.name;
    doctorName = ci.doctorName;
  }

  async function selectPatient() {
    const d: SelectPatientBySearch = new SelectPatientBySearch({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        showRegisterButton: false,
        onEnter: (patient) => {
          name = patient.fullName();
          birthdate = new Date(patient.birthday);
          address = patient.address;
          sex = patient.sexAsKanji + "性";
        },
      },
    });
  }

  async function applyData() {
    const d: TextInputDialog = new TextInputDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        onEnter: (t) => {
          handleData(t);
        },
      },
    });
  }

  function handleData(t: string): void {
    const collect: string[] = [];
    for (let line of t.split(/\r?\n/)) {
      let m = /^HT\s+([\d.]+)/.exec(line);
      if (m) {
        height = m[1];
        continue;
      }
      m = /^BW\s+([\d.]+)/.exec(line);
      if (m) {
        weight = m[1];
        continue;
      }
      m = /^BP\s+([\d/]+)/.exec(line);
      if (m) {
        bloodPressure = `${m[1]} mmHg`;
        continue;
      }
      m = /^BMI\s+([\d.]+)/.exec(line);
      if (m) {
        setLaboExam("BMI", m[1], "", collect);
        continue;
      }
      m = /^[Ww]aist\s+([\d.]+)/.exec(line);
      if (m) {
        setLaboExam("腹囲", m[1], "cm", collect);
        continue;
      }
      m = /^(?:心電図|EKG|ＥＫＧ)[:：\s]+(.+)/.exec(line);
      if (m) {
        shindenzu = m[1];
        continue;
      }
      m = /^(?:胸部Ｘ線|Ｘ線|Xp|Ｘｐ)[:：\s]+(.+)/.exec(line);
      if (m) {
        xp = m[1];
        continue;
      }
      m = /^白血球数\s+([\d.]+)/.exec(line);
      if (m) {
        setLaboExam("白血球数", m[1], "/μL", collect);
      }
      m = /^赤血球数\s+([\d.]+)/.exec(line);
      if (m) {
        setLaboExam("赤血球数", m[1], "ten_thousand_per_ul", collect);
      }
      m = /^ﾍﾓｸﾞﾛﾋﾞﾝ\s+([\d.]+)/.exec(line);
      if (m) {
        setLaboExam("血色素量", m[1], "g/dL", collect);
      }
      m = /^ﾍﾏﾄｸﾘｯﾄ\s+([\d.]+)/.exec(line);
      if (m) {
        setLaboExam("ヘマトクリット", m[1], "%", collect);
      }
      m = /^血小板数\s+([\d.]+)/.exec(line);
      if (m) {
        setLaboExam("血小板数", m[1], "ten_thousand_per_ul", collect);
      }
      m = /^AST\(GOT\)\s+([\d.]+)/.exec(line);
      if (m) {
        setLaboExam("GOT", m[1], "U/L", collect);
      }
      m = /^ALT\(GPT\)\s+([\d.]+)/.exec(line);
      if (m) {
        setLaboExam("GPT", m[1], "U/L", collect);
      }
      m = /^γ-GT\s+([\d.]+)/.exec(line);
      if (m) {
        setLaboExam("γGTP", m[1], "U/L", collect);
      }
      m = /^ｸﾚｱﾁﾆﾝ\s+([\d.]+)/.exec(line);
      if (m) {
        setLaboExam("クレアチニン", m[1], "mg/dL", collect);
      }
      m = /^ｸﾞﾙｺｰｽ\s+([\d.]+)/.exec(line);
      if (m) {
        setLaboExam("血糖値", m[1], "mg/dL", collect);
      }
      m = /^HbA1c\/NGSP\s+([\d.]+)/.exec(line);
      if (m) {
        setLaboExam("HbA1c", m[1], "%", collect);
      }
      m = /^尿酸\s+([\d.]+)/.exec(line);
      if (m) {
        setLaboExam("尿酸", m[1], "mg/dL", collect);
      }
      m = /^LDLｺﾚｽﾃﾛｰﾙ\s+([\d.]+)/.exec(line);
      if (m) {
        setLaboExam("LDLコレステロール", m[1], "mg/dL", collect);
      }
      m = /^HDLｺﾚｽﾃﾛｰﾙ\s+([\d.]+)/.exec(line);
      if (m) {
        setLaboExam("HDLコレステロール", m[1], "mg/dL", collect);
      }
      m = /^TG\(中性脂肪\)\s+([\d.]+)/.exec(line);
      if (m) {
        setLaboExam("中性脂肪", m[1], "mg/dL", collect);
      }
      m = /^尿蛋白定性 \（(.+)\）/.exec(line);
      if (m) {
        urineProtein = encodeUrineResult(m[1]);
      }
      m = /^尿潜血反応 \（(.+)\）/.exec(line);
      if (m) {
        urineBlood = encodeUrineResult(m[1]);
      }
      m = /^尿糖定性 \（(.+)\）/.exec(line);
      if (m) {
        urineGlucose = encodeUrineResult(m[1]);
      }
    }
    // console.log("collect", collect);
    if (tokkijikou && !tokkijikou.endsWith("\n")) {
      tokkijikou += "\n";
    }
    tokkijikou += collect.join("\n");
  }

  function setLaboExam(
    name: string,
    value: string,
    unit: string,
    collect: string[]
  ) {
    const i = kensaLabels.findIndex((e) => e === name);
    const s = `${value} ${unit}`;
    if (i >= 0) {
      kensaValues[i] = s;
    } else {
      collect.push(name + " " + s);
    }
  }

  function hasNoVisualAcuityInput(): boolean {
    return (
      visualAcuityLeft.trim() === "" &&
      visualAcuityLeftCorrected.trim() === "" &&
      visualAcuityRight.trim() === "" &&
      visualAcuityRightCorrected.trim() === ""
    );
  }

  function set(
    ctx: DrawerContext,
    name: string,
    value: string | c.CompositeItem[]
  ): void {
    let box = b.modify(c.getMark(ctx, name), b.shrinkHoriz(2, 0));
    if (typeof value === "string") {
      c.drawText(
        ctx,
        value,
        box,
        "left",
        "center"
      );
    } else {
      c.drawComposite(
        ctx,
        box,
        value
      )
    }
  }

  // function renderUrineExam(
  //   comp: DrawerCompiler,
  //   box: Box,
  //   value: string
  // ): void {
  //   const prevFont = comp.curFont;
  //   const align = {
  //     halign: HorizAlign.Center,
  //     valign: VertAlign.Center,
  //   };
  //   function opt(aux: object): object {
  //     return Object.assign({}, align, aux);
  //   }
  //   switch (value) {
  //     case "":
  //       break;
  //     case "-": {
  //       comp.text(box.shift(1, 0), "－", opt({ dy: -0.5 })); // en-dash
  //       break;
  //     }
  //     case "+/-": {
  //       comp.text(box, "±", opt({ dy: -0.5 }));
  //       break;
  //     }
  //     case "+": {
  //       comp.text(box, "＋", opt({ dy: -0.2 }));
  //       break;
  //     }
  //     case "2+": {
  //       comp.text(box, "2＋", opt({ dy: -0.2 }));
  //       break;
  //     }
  //     case "3+": {
  //       comp.text(box, "3＋", opt({ dy: -0.2 }));
  //       break;
  //     }
  //     case "4+": {
  //       comp.text(box, "4＋", opt({ dy: -0.2 }));
  //       break;
  //     }
  //     default: {
  //       comp.text(box, value, align);
  //       break;
  //     }
  //   }
  //   comp.setFont(prevFont);
  // }

  // function renderTokkijikou(c: DrawerCompiler, box: Box, value: string): void {
  //   const r: Box = box.inset(1, 1, 2, 1);
  //   const lines = value.split(/\r?\n/);
  //   c.textLines(
  //     r,
  //     lines.map((line) => convLine(line, c)),
  //     { leading: 1 }
  //   );
  // }

  function diagonal(ctx: DrawerContext, box: Box) {
    c.line(ctx, b.leftBottom(box), b.rightTop(box))
  }

  function doDisplay() {
    const ctx = createJihiKenshinCompiler();
    c.setFont(ctx, "entry");
    set(ctx, "氏名", name);
    if (birthdate) {
      set(ctx, "生年月日", kanjidate.format(kanjidate.f2, birthdate));
    }
    set(ctx, "性別", sex);
    set(ctx, "住所", address);
    set(ctx, "身長", height || [ { kind: "gap", width: 18 }, { kind: "text", text: " cm" }]);
    set(ctx, "体重", weight || [ { kind: "gap", width: 18 }, { kind: "text", text: " kg" }]);
    set(ctx, "診察", physicalExam);
    if (hasNoVisualAcuityInput()) {
      diagonal(ctx, c.getMark(ctx, "視力"));
    } else {
      const lts: CompositeItem[] = [
        { kind: "text", text: "左" }, 
        { kind: "gap", width: 1 },
        visualAcuityLeft ? { kind: "text", text: visualAcuityLeft } : { kind: "gap", width: 8 }
      ];
      if (visualAcuityLeftCorrected) {
        lts.push({ kind: "gap", width: 1 }, { kind: "text", text: `(${visualAcuityLeftCorrected})` });
      }
      set(ctx, "視力左", lts);
      const rts: CompositeItem[] = [
        { kind: "text", text: "右" }, 
        { kind: "gap", width: 1 },
        visualAcuityRight ? { kind: "text", text: visualAcuityRight } : { kind: "gap", width: 8 }
      ];
      if (visualAcuityRightCorrected) {
        rts.push({ kind: "gap", width: 1 }, { kind: "text", text: `(${visualAcuityRightCorrected})` });
      }
      set(ctx, "視力右", rts);
    }
    // if (hearingExamConducted === "実施") {
    //   const b = comp.getMark("聴力");
    //   let [left, right] = b.splitToEvenCols(2);
    //   left = comp.textAndAdvance(left.insetLeft(1), "左", {
    //     valign: VertAlign.Center,
    //   });
    //   let [top, bottom] = left.insetLeft(0.5).splitToEvenRows(2);
    //   let saveFont = comp.setFont("small-entry");
    //   comp.text(top, "4000Hz 所見" + hearingLeft4000Loss, {
    //     valign: VertAlign.Center,
    //   });
    //   comp.text(bottom, "1000Hz 所見" + hearingLeft1000Loss, {
    //     valign: VertAlign.Center,
    //   });
    //   comp.setFont(saveFont);
    //   right = comp.textAndAdvance(right.insetLeft(1), "右", {
    //     valign: VertAlign.Center,
    //   });
    //   [top, bottom] = right.insetLeft(0.5).splitToEvenRows(2);
    //   saveFont = comp.setFont("small-entry");
    //   comp.text(top, "4000Hz 所見" + hearingRight4000Loss, {
    //     valign: VertAlign.Center,
    //   });
    //   comp.text(bottom, "1000Hz 所見" + hearingRight1000Loss, {
    //     valign: VertAlign.Center,
    //   });
    //   comp.setFont(saveFont);
    // } else {
    //   const b = comp.getMark("聴力");
    //   comp.line(...b.leftBottom(), ...b.rightTop());
    // }
    // set(ctx, "血圧", bloodPressure);
    // set(ctx, "心電図", shindenzu);
    // comp.paragraph(comp.getMark("既往歴").inset(1, 0, 2, 0), kioureki);
    // comp.paragraph(comp.getMark("Ｘ線").inset(1, 0, 2, 0), xp);
    // if (xpConductedDate) {
    //   set(ctx, "Ｘ線撮影日", kanjidate.format(kanjidate.f2, xpConductedDate));
    // }
    // [...Array(9).keys()].forEach((i) => {
    //   set(ctx, `血液検査名${i + 1}`, kensaLabels[i]);
    //   let [value, unit]: (string | (string | TextVariant)[])[] =
    //     kensaValues[i].split(/\s+/);
    //   if (unit === "ten_thousand_per_ul") {
    //     unit = [
    //       "x10",
    //       comp.str("4", { font: "small-entry", dy: -1.2, padRight: 1.0 }),
    //       "/μL",
    //     ];
    //   }
    //   if (value) {
    //     comp.getMark(`血液検査結果${i + 1}`).withCols(
    //       [18],
    //       (b) => {
    //         comp.text(b, value, {
    //           halign: HorizAlign.Right,
    //           valign: VertAlign.Center,
    //         });
    //       },
    //       (b) => {
    //         comp.text(b.shrinkToRight(1), unit ?? "", {
    //           halign: HorizAlign.Left,
    //           valign: VertAlign.Center,
    //         });
    //       }
    //     );
    //   } else {
    //     const b = comp.getMark(`血液検査結果${i + 1}`);
    //     comp.line(...b.leftBottom(), ...b.rightTop());
    //   }
    // });
    // let prevFont = comp.curFont;
    // renderUrineExam(comp, comp.getMark("尿蛋白"), urineProtein);
    // renderUrineExam(comp, comp.getMark("尿潜血"), urineBlood);
    // renderUrineExam(comp, comp.getMark("尿糖"), urineGlucose);
    // renderTokkijikou(comp, comp.getMark("その他特記事項"), tokkijikou);
    // comp.setFont(prevFont);
    // set(ctx, "発行日", kanjidate.format(kanjidate.f2, issueDate));
    // set(ctx, "住所1", address1);
    // set(ctx, "住所2", address2);
    // set(ctx, "クリニック名", clinicName);
    // comp.withFont("large-entry", () => set(ctx, "医師名", doctorName));
    // if (showMarker) {
    //   comp.labelMarks();
    // }

    const d: DrawerDialog = new DrawerDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "自費健診印刷",
        ops: c.getOps(ctx),
        width: A4[0],
        height: A4[1],
        scale: 2,
      },
    });
  }
</script>

<div style:display={isVisible ? "block" : "none"}>
  <ServiceHeader title="自費健診" />
  <div class="two-cols">
    <div class="col-1">
      <div>
        <h3 class="inline-block">患者情報</h3>
        <a href="javascript:void(0)" class="small-link" on:click={selectPatient}
          >取り込み</a
        >
      </div>
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
      <div>
        <h3 class="inline-block">身体所見等</h3>
        <a href="javascript:void(0)" class="small-link" on:click={applyData}
          >取り込み</a
        >
      </div>
      <div class="input-panel">
        <span>身長</span>
        <div class="inline-block">
          <input type="text" style:width="5em" bind:value={height} /> cm
        </div>
        <span>体重</span>
        <div class="inline-block">
          <input type="text" style:width="5em" bind:value={weight} /> kg
        </div>
        <span>診察</span>
        <div class="inline-block">
          <input type="text" style:width="5em" bind:value={physicalExam} />
        </div>
        <span>視力</span>
        <div class="inline-block">
          <div style="margin-bottom:3px;">
            左 <input
              type="text"
              style:width="3em"
              bind:value={visualAcuityLeft}
            />
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
        <span>既往歴</span>
        <input type="text" bind:value={kioureki} />
        <span>Ｘ線</span>
        <input type="text" bind:value={xp} />
        <span>Ｘ線撮影日</span>
        <EditableDate bind:date={xpConductedDate} />
      </div>
      <div>
        <h3 class="inline-block">その他</h3>
        <a
          href="javascript:void(0)"
          class="small-link"
          on:click={applyClinicInfo}>取り込み</a
        >
      </div>
      <div class="input-panel">
        <span>発行日</span>
        <EditableDate bind:date={issueDate} />
        <span>住所1</span>
        <input type="text" bind:value={address1} />
        <span>住所2</span>
        <input type="text" bind:value={address2} />
        <span>クリニック名</span>
        <input type="text" bind:value={clinicName} />
        <span>医師名</span>
        <input type="text" bind:value={doctorName} />
      </div>
      <div>
        <input type="checkbox" bind:value={showMarker} /> マーカー表示
      </div>
    </div>
    <div class="col2">
      <div>
        <h3 class="inline-block">検査結果</h3>
        <a href="javascript:void(0)" class="small-link" on:click={applyData}
          >取り込み</a
        >
      </div>
      <divc class="input-panel">
        {#each [...Array(9).keys()] as i (i)}
          <span>血液検査{i + 1}</span>
          <div class="inline-block">
            <span>名前</span>
            <input
              type="text"
              bind:value={kensaLabels[i]}
              style:margin="0 0 2px 0"
            />
            <span>結果</span>
            <input type="text" bind:value={kensaValues[i]} />
          </div>
        {/each}
        <span>尿蛋白</span>
        <select bind:value={urineProtein}>
          <option value="" />
          <option value="-">-</option>
          <option>+/-</option>
          <option>+</option>
          <option>++</option>
          <option>+++</option>
          <option>++++</option>
        </select>
        <span>尿潜血</span>
        <select bind:value={urineBlood}>
          <option />
          <option>-</option>
          <option>+/-</option>
          <option>+</option>
          <option>++</option>
          <option>+++</option>
          <option>++++</option>
        </select>
        <span>尿糖</span>
        <select bind:value={urineGlucose}>
          <option />
          <option>-</option>
          <option>+/-</option>
          <option>+</option>
          <option>++</option>
          <option>+++</option>
          <option>++++</option>
        </select>
        <span>特記事項</span>
        <textarea bind:value={tokkijikou} />
      </divc>
    </div>
  </div>
  <div class="commands">
    <button on:click={doDisplay}>表示</button>
  </div>
</div>

<style>
  .two-cols {
    display: grid;
    grid-template-columns: 400px 400px;
  }
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

  textarea {
    resize: vertical;
    width: 100%;
    height: 140px;
  }

  h3.inline-block {
    margin-right: 10px;
  }

  a.small-link {
    font-size: 80%;
    padding: 2px;
    border: 1px solid var(--primary-color);
    border-radius: 2px;
    position: relative;
    top: -2px;
  }
</style>
