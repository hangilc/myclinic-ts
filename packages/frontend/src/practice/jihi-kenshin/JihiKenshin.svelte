<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";
  import { createJihiKenshinCompiler } from "./jihi-kenshin-compiler";
  import EditableDate from "@/lib/editable-date/EditableDate.svelte";

  import type { Box } from "@/lib/drawer/compiler/box";
  import api from "@/lib/api";
  import SelectPatientBySearch from "../exam/select-patient-dialogs/SelectPatientBySearch.svelte";
  import TextInputDialog from "./TextInputDialog.svelte";
  import { encodeUrineResult } from "./urine-exam";
  import * as c from "@/lib/drawer/compiler/compiler";
  import * as b from "@/lib/drawer/compiler/box";
  import type { DrawerContext } from "@/lib/drawer/compiler/context";
  import type { CompositeItem } from "@/lib/drawer/compiler/compiler";
  import { hasCompTmpl, parseCompTmpl } from "./composite-template";
  import { A4 } from "@/lib/drawer/compiler/paper-size";
  import { FormatDate } from "myclinic-util";

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
  // let showMarker: boolean = false;

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
    let collect: string[] = [];
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
      m = /^(?:既往歴)[:：\s]+(.+)/.exec(line);
      if (m) {
        kioureki = m[1];
        continue;
      }
      m = /^白血球数\s+([\d.]+)/.exec(line);
      if (m) {
        setLaboExam("白血球数", m[1], "/μL", collect);
      }
      m = /^赤血球数\s+([\d.]+)/.exec(line);
      if (m) {
        setLaboExam("赤血球数", m[1], "[[ten_thousand_per_ul]]", collect);
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
        setLaboExam("血小板数", m[1], "[[ten_thousand_per_ul]]", collect);
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
    if (tokkijikou && !tokkijikou.endsWith("\n")) {
      tokkijikou += "\n";
    }
	collect = reorderCollection(collect);
    tokkijikou += collect.join("\n");
  }

  function reorderCollection(collect: string[]): string[] {
    let mark: number | undefined = undefined;
    let result: string[] = [];
    let 中性脂肪: string | undefined;
    let LDLコレステロール: string | undefined;
    let HDLコレステロール: string | undefined;
    collect.forEach((line, index) => {
      if (
        mark === undefined &&
        (line.startsWith("中性脂肪") ||
          line.startsWith("LDLコレステロール") ||
          line.startsWith("HDLコレステロール"))
      ) {
        mark = index;
      }
      if (line.startsWith("中性脂肪")) {
        中性脂肪 = line;} else 
      if (line.startsWith("LDLコレステロール")) {
        LDLコレステロール = line;} else 
      if (line.startsWith("HDLコレステロール")) {
        HDLコレステロール = line;
      } else {
		result.push(line);
	  }
    });
	if( mark != undefined ){
	  let lines: string[] =
		  [LDLコレステロール, HDLコレステロール, 中性脂肪].filter(line =>
			line !== undefined
		  );
	  result.splice(mark, 0, ...lines);
	}
	if( collect.length !== result.length ){
	  alert("inconsisten reorder collect result");
	}
    return result;
  }

  function setLaboExam(
    name: string,
    value: string,
    unit: string,
    collect: string[],
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
    value: string | c.CompositeItem[],
  ): void {
    let box = b.modify(c.getMark(ctx, name).box, b.shrinkHoriz(2, 0));
    if (typeof value === "string") {
      c.drawText(ctx, value, box, "left", "center");
    } else {
      c.drawComposite(ctx, box, value);
    }
  }

  function renderUrineExam(ctx: DrawerContext, box: Box, value: string): void {
    const prevFont = c.getCurrentFont(ctx);
    switch (value) {
      case "":
        break;
      case "-": {
        c.drawText(
          ctx,
          "－",
          b.modify(box, b.shift(1, 0)),
          "center",
          "center",
          { dy: -0.5 },
        ); // en-dash
        break;
      }
      case "+/-": {
        c.drawText(ctx, "±", box, "center", "center", { dy: -0.5 });
        break;
      }
      case "+": {
        c.drawText(ctx, "＋", box, "center", "center", { dy: -0.2 });
        break;
      }
      case "2+": {
        c.drawText(ctx, "2＋", box, "center", "center", { dy: -0.2 });
        break;
      }
      case "3+": {
        c.drawText(ctx, "3＋", box, "center", "center", { dy: -0.2 });
        break;
      }
      case "4+": {
        c.drawText(ctx, "4＋", box, "center", "center", { dy: -0.2 });
        break;
      }
      default: {
        c.drawText(ctx, value, box, "center", "center");
        break;
      }
    }
    c.setFont(ctx, prevFont);
  }

  function renderTokkijikou(ctx: DrawerContext, box: Box, value: string): void {
    const r: Box = b.modify(box, b.inset(1, 1, 2, 1));
    const lines = value.split(/\r?\n/);
    c.drawTextTmpls(ctx, lines, r, rewriteComp, { leading: 1 });
  }

  function diagonal(ctx: DrawerContext, box: Box) {
    c.line(ctx, b.leftBottom(box), b.rightTop(box));
  }

  function rewriteComp(key: string): CompositeItem[] {
    if (key === "ten_thousand_per_ul") {
      return [
        { kind: "text", text: "x10" },
        { kind: "text-by-font", text: "4", fontName: "small-entry", dy: -1.2 },
        { kind: "gap", width: 1.0 },
        { kind: "text", text: "/μL" },
      ];
    } else {
      throw new Error(`Unknown composite template key: ${key}`);
    }
  }

  function doDisplay() {
    const ctx = createJihiKenshinCompiler();
    c.setFont(ctx, "entry");
    set(ctx, "氏名", name);
    if (birthdate) {
      set(ctx, "生年月日", FormatDate.f2(birthdate));
    }
    set(ctx, "性別", sex);
    set(ctx, "住所", address);
    set(
      ctx,
      "身長",
      height || [
        { kind: "gap", width: 18 },
        { kind: "text", text: " cm" },
      ],
    );
    set(
      ctx,
      "体重",
      weight || [
        { kind: "gap", width: 18 },
        { kind: "text", text: " kg" },
      ],
    );
    set(ctx, "診察", physicalExam);
    if (hasNoVisualAcuityInput()) {
      diagonal(ctx, c.getMark(ctx, "視力").box);
    } else {
      const lts: CompositeItem[] = [
        { kind: "text", text: "左" },
        { kind: "gap", width: 1 },
        visualAcuityLeft
          ? { kind: "text", text: visualAcuityLeft }
          : { kind: "gap", width: 8 },
      ];
      if (visualAcuityLeftCorrected) {
        lts.push(
          { kind: "gap", width: 1 },
          { kind: "text", text: `(${visualAcuityLeftCorrected})` },
        );
      }
      set(ctx, "視力左", lts);
      const rts: CompositeItem[] = [
        { kind: "text", text: "右" },
        { kind: "gap", width: 1 },
        visualAcuityRight
          ? { kind: "text", text: visualAcuityRight }
          : { kind: "gap", width: 8 },
      ];
      if (visualAcuityRightCorrected) {
        rts.push(
          { kind: "gap", width: 1 },
          { kind: "text", text: `(${visualAcuityRightCorrected})` },
        );
      }
      set(ctx, "視力右", rts);
    }
    if (hearingExamConducted === "実施") {
      const bb = c.getMark(ctx, "聴力").box;
      let [left, right] = b.splitToColumns(bb, b.evenSplitter(2));
      let fontSize = c.currentFontSize(ctx);
      b.withSplitColumns(
        b.modify(left, b.shrinkHoriz(1, 0)),
        b.splitAt(fontSize + 0.5),
        ([c1, c2]) => {
          c.drawText(ctx, "左", c1, "left", "center");
          b.withSplitRows(c2, b.evenSplitter(2), ([top, bottom]) => {
            let saveFont = c.getCurrentFont(ctx);
            c.setFont(ctx, "small-entry");
            c.drawText(
              ctx,
              "4000Hz 所見" + hearingLeft4000Loss,
              top,
              "left",
              "center",
            );
            c.drawText(
              ctx,
              "1000Hz 所見" + hearingLeft1000Loss,
              bottom,
              "left",
              "center",
            );
            c.setFont(ctx, saveFont);
          });
        },
      );
      b.withSplitColumns(
        b.modify(right, b.shrinkHoriz(1, 0)),
        b.splitAt(fontSize + 0.5),
        ([c1, c2]) => {
          c.drawText(ctx, "右", c1, "left", "center");
          b.withSplitRows(c2, b.evenSplitter(2), ([top, bottom]) => {
            let saveFont = c.getCurrentFont(ctx);
            c.setFont(ctx, "small-entry");
            c.drawText(
              ctx,
              "4000Hz 所見" + hearingRight4000Loss,
              top,
              "left",
              "center",
            );
            c.drawText(
              ctx,
              "1000Hz 所見" + hearingRight1000Loss,
              bottom,
              "left",
              "center",
            );
            c.setFont(ctx, saveFont);
          });
        },
      );
    } else {
      diagonal(ctx, c.getMark(ctx, "聴力").box);
    }
    set(ctx, "血圧", bloodPressure);
    set(ctx, "心電図", shindenzu);
    c.paragraph(
      ctx,
      kioureki,
      c.getMark(ctx, "既往歴", b.inset(1, 0, 2, 0)).box,
    );
    c.paragraph(ctx, xp, c.getMark(ctx, "Ｘ線", b.inset(1, 0, 2, 0)).box);
    if (xpConductedDate) {
      set(ctx, "Ｘ線撮影日", FormatDate.f2(xpConductedDate));
    }
    [...Array(9).keys()].forEach((i) => {
      set(ctx, `血液検査名${i + 1}`, kensaLabels[i]);
      let [value, unit]: string[] = kensaValues[i].split(/\s+/);
      if (value) {
        b.withSplitColumns(
          c.getMark(ctx, `血液検査結果${i + 1}`).box,
          b.splitAt(18),
          ([left, right]) => {
            c.drawText(ctx, value, left, "right", "center");
            const unitBox = b.modify(right, b.shrinkHoriz(1, 0));
            if (hasCompTmpl(unit)) {
              c.drawComposite(ctx, unitBox, parseCompTmpl(unit, rewriteComp));
            } else {
              c.drawText(ctx, unit, unitBox, "left", "center");
            }
          },
        );
      } else {
        const bb = c.getMark(ctx, `血液検査結果${i + 1}`).box;
        c.line(ctx, b.leftBottom(bb), b.rightTop(bb));
      }
    });
    let prevFont = c.getCurrentFont(ctx);
    renderUrineExam(ctx, c.getMark(ctx, "尿蛋白").box, urineProtein);
    renderUrineExam(ctx, c.getMark(ctx, "尿潜血").box, urineBlood);
    renderUrineExam(ctx, c.getMark(ctx, "尿糖").box, urineGlucose);
    renderTokkijikou(ctx, c.getMark(ctx, "その他特記事項").box, tokkijikou);
    c.setFont(ctx, prevFont);
    set(ctx, "発行日", FormatDate.f2(issueDate));
    set(ctx, "住所1", address1);
    set(ctx, "住所2", address2);
    set(ctx, "クリニック名", clinicName);
    c.withFont(ctx, "large-entry", () => set(ctx, "医師名", doctorName));

    const d: DrawerDialog = new DrawerDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "自費健診印刷",
        ops: c.getOps(ctx),
        width: A4.width,
        height: A4.height,
        scale: 2,
      },
    });
  }
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
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
      <!-- <div>
        <input type="checkbox" bind:value={showMarker} /> マーカー表示
      </div> -->
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
