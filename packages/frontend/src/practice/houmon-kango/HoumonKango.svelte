<script lang="ts">
  import PreTextDialog from "@/lib/PreTextDialog.svelte";
  import SearchPatientDialog from "@/lib/SearchPatientDialog.svelte";
  import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";
  import { mkDrawerContext } from "@/lib/drawer/compiler/context";
  import {
    createRendererInputs,
    createRendererInterface,
    createRendererMap,
  } from "@/lib/drawer/compiler/create-renderer";
  import { drawHoumonKango } from "@/lib/drawer/forms/houmon-kango/houmon-kango-drawer";
  import EditableDate from "@/lib/editable-date/EditableDate.svelte";
  import { dateToSqlDate, type ClinicInfo, type Patient } from "myclinic-model";
  import { type DataInterface, mkDataMap } from "./data-form";
  import { KanjiDate, GengouList, calcAge } from "kanjidate";
  import * as kanjidate from "kanjidate";
  import ChevronDown from "@/icons/ChevronDown.svelte";
  import ChevronUp from "@/icons/ChevronUp.svelte";
  import { convertToLastDateOfMonth, incDay, incMonth, sqlDateToDate } from "@/lib/date-util";
  import api from "@/lib/api";
  import { parseDataSource } from "./houmon-kango-helper";

  export let isVisible: boolean;
  let patient: Patient | undefined = undefined;
  let startDate: Date | null = null;
  let uptoDate: Date | null = null;
  let issueDate: Date = new Date();
  let dataMap: DataInterface;
  let showInputs = false;
  type DataMapKeys = keyof DataInterface;
  const gengouList: string[] = GengouList.map((g) => g.kanji);
  let showTitleInputChoices = false;
  let clinicInfo: ClinicInfo;
  let dataSource: string = "";
  let dataSourceErrors: string[] = [];
  const dataMarker = "[[[訪問看護]]]";

  init();
  initDataMap();

  doIssueDateChange();

  async function init() {
    clinicInfo = await api.getClinicInfo();
    setClinicInfo(clinicInfo);
  }

  function initDataMap() {
    dataMap = mkDataMap();
    dataMap["タイトル"] = "介護予防訪問看護・訪問看護指示書";
    dataMap["サブタイトル"] = "訪問看護指示期間";
  }

  function doSelectPatient() {
    const d: SearchPatientDialog = new SearchPatientDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "患者選択",
        onEnter: (selected: Patient) => {
          patient = selected;
          doPatientUpdate(patient);
        },
      },
    });
  }

  function doClearPatient() {
    patient = undefined;
    startDate = null;
    uptoDate = null;
    issueDate = new Date();
    initDataMap();
    dataSource = "";
  }

  function clear(names: string[]) {
    const m: any = dataMap;
    names.forEach((name) => {
      if (name in m) {
        m[name] = "";
      }
    });
  }

  function doPatientUpdate(patient: Patient) {
    dataMap["患者氏名"] = `${patient.lastName}${patient.firstName}`;
    dataMap["患者住所"] = patient.address;
    const k = new KanjiDate(new Date(patient.birthday));
    clear(gengouList.map((g) => `生年月日（元号：${g}）`));
    const m: any = dataMap;
    const gname = `生年月日（元号：${k.gengou}）`;
    if (gname in m) {
      m[gname] = "1";
    }
    dataMap["生年月日（年）"] = k.nen.toString();
    dataMap["生年月日（月）"] = k.month.toString();
    dataMap["生年月日（日）"] = k.day.toString();
    setAge(patient);
  }

  function setAge(patient: Patient) {
    const age = calcAge(new Date(patient.birthday), issueDate ?? new Date());
    dataMap["年齢"] = age.toString();
  }

  function clearAge() {
    dataMap["年齢"] = "";
  }

  function doCreate() {
    // const ops = drawHoumonKango(devDataMap);
    const ops = drawHoumonKango(dataMap);

    const d: DrawerDialog = new DrawerDialog({
      target: document.body,
      props: {
        ops,
        destroy: () => d.$destroy(),
        width: 210 * 1.5,
        height: 297 * 1.5,
        viewBox: "0 0 210 297",
        scale: 1.5,
      },
    });
  }

  function doDataInterface() {
    const ctx = mkDrawerContext();
    drawHoumonKango({}, ctx);
    const text = createRendererInterface(ctx);
    const d: PreTextDialog = new PreTextDialog({
      target: document.body,
      props: {
        title: "訪問看護データ",
        destroy: () => d.$destroy(),
        text,
      },
    });
  }

  function doDataMap() {
    const ctx = mkDrawerContext();
    drawHoumonKango({}, ctx);
    const text = createRendererMap(ctx);
    const d: PreTextDialog = new PreTextDialog({
      target: document.body,
      props: {
        title: "訪問看護データマップ",
        destroy: () => d.$destroy(),
        text,
      },
    });
  }

  function doDataInputs() {
    const ctx = mkDrawerContext();
    drawHoumonKango({}, ctx);
    const text = createRendererInputs(ctx);
    const d: PreTextDialog = new PreTextDialog({
      target: document.body,
      props: {
        title: "訪問看護データインプット",
        destroy: () => d.$destroy(),
        text,
      },
    });
  }

  function doTitleInputChoice(event: MouseEvent) {
    let target = event.target as HTMLElement;
    dataMap["タイトル"] = target.innerText;
    dataMap["サブタイトル"] = target.getAttribute("data-subtitle") ?? "";
    showTitleInputChoices = false;
  }

  function doStartDateChange() {
    if (startDate) {
      const k = new KanjiDate(startDate);
      dataMap["訪問看護指示期間開始（元号）"] = k.gengou;
      dataMap["訪問看護指示期間開始（年）"] = k.nen.toString();
      dataMap["訪問看護指示期間開始（月）"] = k.month.toString();
      dataMap["訪問看護指示期間開始（日）"] = k.day.toString();
      if (!uptoDate) {
        if (startDate.getDate() === 1) {
          const d = incMonth(startDate, 2);
          uptoDate = convertToLastDateOfMonth(d);
        } else {
          let d = incMonth(startDate, 3);
          d = incDay(d, -1);
          uptoDate = d;
        }
        doUptoDateChange();
      }
    } else {
      dataMap["訪問看護指示期間開始（元号）"] = "";
      dataMap["訪問看護指示期間開始（年）"] = "";
      dataMap["訪問看護指示期間開始（月）"] = "";
      dataMap["訪問看護指示期間開始（日）"] = "";
    }
  }

  function doUptoDateChange() {
    if (uptoDate) {
      const k = new KanjiDate(uptoDate);
      dataMap["訪問看護指示期間期限（元号）"] = k.gengou;
      dataMap["訪問看護指示期間期限（年）"] = k.nen.toString();
      dataMap["訪問看護指示期間期限（月）"] = k.month.toString();
      dataMap["訪問看護指示期間期限（日）"] = k.day.toString();
    } else {
      dataMap["訪問看護指示期間期限（元号）"] = "";
      dataMap["訪問看護指示期間期限（年）"] = "";
      dataMap["訪問看護指示期間期限（月）"] = "";
      dataMap["訪問看護指示期間期限（日）"] = "";
    }
  }

  function doIssueDateChange() {
    if (issueDate) {
      const k = new KanjiDate(issueDate);
      dataMap["発行日（元号）"] = k.gengou;
      dataMap["発行日（年）"] = k.nen.toString();
      dataMap["発行日（月）"] = k.month.toString();
      dataMap["発行日（日）"] = k.day.toString();
    } else {
      dataMap["発行日（元号）"] = "";
      dataMap["発行日（年）"] = "";
      dataMap["発行日（月）"] = "";
      dataMap["発行日（日）"] = "";
    }
    if (issueDate && patient) {
      setAge(patient);
    } else {
      clearAge();
    }
  }

  function setClinicInfo(info: ClinicInfo) {
    dataMap["医療機関名"] = info.name;
    dataMap["医療機関（住所）"] = `${info.postalCode} ${info.address}`;
    dataMap["医療機関（電話）"] = info.tel;
    dataMap["医療機関（ＦＡＸ）"] = info.fax;
    dataMap["医師氏名"] = info.doctorName;
  }

  async function doRestore() {
    let src = dataSource;
    {
      const i = src.indexOf(dataMarker);
      if( i >= 0 ){
        src = src.substring(i + dataMarker.length);
      }
    }
    const parsed = parseDataSource(src);
    const keys = Object.keys(dataMap);
    const m: any = dataMap;
    dataSourceErrors = parsed.errors;
    for (let key in parsed.data) {
      const value = parsed.data[key];
      if( key === "patient-id" ){
        const patientId = parseInt(value);
        patient = await api.getPatient(patientId);
        doPatientUpdate(patient);
      } else if( key === "start-date" ){
        startDate = sqlDateToDate(value);
        doStartDateChange();
      } else if( key === "upto-date" ){
        uptoDate = sqlDateToDate(value);
        doUptoDateChange();
      } else if( key === "issue-date" ){
        issueDate = sqlDateToDate(value);
        doIssueDateChange();
      } else if (keys.includes(key)) {
        m[key] = value;
      } else {
        dataSourceErrors = [...dataSourceErrors, `Invalid key: ${key}`];
      }
    }
    dataMap = dataMap;
  }

  function capture(): {
    patient: Patient | undefined,
    startDate: Date | null,
    uptoDate: Date | null,
    issueDate: Date | null,
    data: string,
    map: Record<string, string>,
  } {
    const cap: Record<string, string> = {};
    const excludes: string[] = [
      "患者氏名",
      "生年月日（元号：昭和）",
      "生年月日（年）",
      "生年月日（月）",
      "生年月日（日）",
      "年齢",
      "訪問看護指示期間開始（元号）",
      "訪問看護指示期間開始（年）",
      "訪問看護指示期間開始（月）",
      "訪問看護指示期間開始（日）",
      "訪問看護指示期間期限（元号）",
      "訪問看護指示期間期限（年）",
      "訪問看護指示期間期限（月）",
      "訪問看護指示期間期限（日）",
      "患者住所",
      "発行日（元号）",
      "発行日（年）",
      "発行日（月）",
      "発行日（日）",
      "医療機関（住所）",
      "医療機関（電話）",
      "医療機関（ＦＡＸ）",
      "医師氏名",
      "医療機関名",
    ];
    if (patient) {
      cap["patient-id"] = patient.patientId.toString();
    }
    if (startDate) {
      cap["start-date"] = dateToSqlDate(startDate);
    }
    if (uptoDate) {
      cap["upto-date"] = dateToSqlDate(uptoDate);
    }
    if (issueDate) {
      cap["issue-date"] = dateToSqlDate(issueDate);
    }
    for (let key in dataMap) {
      if (!excludes.includes(key)) {
        const value = dataMap[key as DataMapKeys];
        if (value) {
          cap[key] = value;
        }
      }
    }
    return {
      patient,
      startDate,
      uptoDate,
      issueDate,
      data: Object.entries(cap)
      .map(([key, value]) => `${key}:::${value}`)
      .join("\n"),
      map: cap,
    }
  }

  function doCapture() {
    const { data: cap } = capture();
    dataSource = Object.entries(cap)
      .map(([key, value]) => `${key}:::${value}`)
      .join("\n");
  }

  function doUpdateDates() {
    issueDate = new Date();
    doIssueDateChange();
    if( uptoDate ){
      startDate = incDay(uptoDate, 1);
      uptoDate = null;
      doStartDateChange();
    }
  }

  function doShinryouroku() {
    const { data, startDate, uptoDate, map } = capture();
    const startPart = startDate ? `${kanjidate.format(kanjidate.f2, startDate)}から` : "";
    const uptoPart = uptoDate ? `${kanjidate.format(kanjidate.f2, uptoDate)}まで` : "";
    let shijisho = map["タイトル"];
    if( shijisho.includes("訪問看護指示書") ){
      shijisho = "訪問看護指示書";
    }
    const lines: string[] = [];
    lines.push(`${shijisho}作成。`, "\n");
    if( map["提出先"] ){
      lines.push(`${map["提出先"]}。`)
    }
    if( startPart && uptoPart ){
      lines.push(`${startPart}、${uptoPart}。`)
    }
    lines.push("\n\n[[[訪問看護]]]\n");
    lines.push(data);
    lines.push("\n");
    const text = lines.join("");
    navigator.clipboard.writeText(text);
    alert("クリップボードに診療録用文をコピーしました。")
  }
</script>

{#if isVisible}
  <div class="title">訪問看護</div>
  <div>
    {#if patient === undefined}
      <button on:click={doSelectPatient}>患者選択</button>
    {:else}
      <button on:click={doClearPatient}>患者終了</button>
    {/if}
  </div>
  {#if patient}
    患者：{patient.lastName}
    {patient.firstName}
  {/if}
  <div>
    <div>
      タイトル：<input
        type="text"
        bind:value={dataMap["タイトル"]}
        class="title-input"
      />
      <a
        class="title-selector-link"
        href="javascript:void(0)"
        on:click={() => (showTitleInputChoices = !showTitleInputChoices)}
      >
        {#if showTitleInputChoices}
          <ChevronUp />
        {:else}
          <ChevronDown />
        {/if}
      </a>
    </div>
    {#if showTitleInputChoices}
      <!-- svelte-ignore missing-declaration -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="title-input-choice-wrapper">
        <div
          class="title-input-choice"
          on:click={doTitleInputChoice}
          data-subtitle="訪問看護指示期間"
        >
          介護予防訪問看護・訪問看護指示書
        </div>
        <div
          class="title-input-choice"
          on:click={doTitleInputChoice}
          data-subtitle="指示期間"
        >
          訪問リハビリテーション診療情報提供書
        </div>
      </div>
    {/if}
  </div>
  <div>
    開始日：<EditableDate bind:date={startDate} onChange={doStartDateChange} />
    終了日：<EditableDate bind:date={uptoDate} onChange={doUptoDateChange} />
  </div>
  <div>
    発行日：<EditableDate bind:date={issueDate} onChange={doIssueDateChange} />
  </div>
  <div>
    <span>提出先：</span><input
      type="text"
      class="send-to-input"
      bind:value={dataMap["提出先"]}
    />
  </div>
  <div class="data-source-wrapper">
    <span>データ：</span>
    <div>
      <textarea bind:value={dataSource} />
      {#if dataSourceErrors.length > 0}
        <div class="data-source-errors">
          {#each dataSourceErrors as err}
            <div>{err}</div>
          {/each}
        </div>
      {/if}
      <div>
        <button on:click={doCapture}>指示書→データ</button>
        <button on:click={doRestore}>データ→指示書</button>
        <button on:click={doUpdateDates}>指示書日付更新</button>
        <button on:click={doShinryouroku}>指示書→診療録</button>
      </div>
    </div>
  </div>
  <div>
    <button on:click={doCreate}>作成</button>
  </div>
  <div>
    {#if showInputs}
      <a href="javascript:void(0)" on:click={() => (showInputs = false)}
        >インプットを隠す</a
      >
    {:else}
      <a href="javascript:void(0)" on:click={() => (showInputs = true)}
        >インプットを表示</a
      >
    {/if}
    <div style:display={showInputs ? "block" : "none"}>
      <div class="data-inputs">
        <span>サブタイトル</span><input
          type="text"
          bind:value={dataMap["サブタイトル"]}
        />
        <span>訪問看護指示期間開始（元号）</span><input
          type="text"
          bind:value={dataMap["訪問看護指示期間開始（元号）"]}
        />
        <span>訪問看護指示期間開始（年）</span><input
          type="text"
          bind:value={dataMap["訪問看護指示期間開始（年）"]}
        />
        <span>訪問看護指示期間開始（月）</span><input
          type="text"
          bind:value={dataMap["訪問看護指示期間開始（月）"]}
        />
        <span>訪問看護指示期間開始（日）</span><input
          type="text"
          bind:value={dataMap["訪問看護指示期間開始（日）"]}
        />
        <span>訪問看護指示期間期限（元号）</span><input
          type="text"
          bind:value={dataMap["訪問看護指示期間期限（元号）"]}
        />
        <span>訪問看護指示期間期限（年）</span><input
          type="text"
          bind:value={dataMap["訪問看護指示期間期限（年）"]}
        />
        <span>訪問看護指示期間期限（月）</span><input
          type="text"
          bind:value={dataMap["訪問看護指示期間期限（月）"]}
        />
        <span>訪問看護指示期間期限（日）</span><input
          type="text"
          bind:value={dataMap["訪問看護指示期間期限（日）"]}
        />
        <span>患者氏名</span><input
          type="text"
          name="患者氏名"
          bind:value={dataMap["患者氏名"]}
        />
        <span>生年月日（元号：明治）</span><input
          type="text"
          bind:value={dataMap["生年月日（元号：明治）"]}
        />
        <span>生年月日（元号：大正）</span><input
          type="text"
          bind:value={dataMap["生年月日（元号：大正）"]}
        />
        <span>生年月日（元号：昭和）</span><input
          type="text"
          bind:value={dataMap["生年月日（元号：昭和）"]}
        />
        <span>生年月日（元号：平成）</span><input
          type="text"
          bind:value={dataMap["生年月日（元号：平成）"]}
        />
        <span>生年月日（年）</span><input
          type="text"
          bind:value={dataMap["生年月日（年）"]}
        />
        <span>生年月日（月）</span><input
          type="text"
          bind:value={dataMap["生年月日（月）"]}
        />
        <span>生年月日（日）</span><input
          type="text"
          bind:value={dataMap["生年月日（日）"]}
        />
        <span>年齢</span><input type="text" bind:value={dataMap["年齢"]} />
        <span>患者住所</span><input
          type="text"
          bind:value={dataMap["患者住所"]}
        />
        <span>主たる傷病名</span><input
          type="text"
          bind:value={dataMap["主たる傷病名"]}
        />
        <span>病状</span><input type="text" bind:value={dataMap["病状"]} />
        <span>薬剤</span><input type="text" bind:value={dataMap["薬剤"]} />
        <span>寝たきり度(J1)</span><input
          type="text"
          bind:value={dataMap["寝たきり度(J1)"]}
        />
        <span>寝たきり度(J2)</span><input
          type="text"
          bind:value={dataMap["寝たきり度(J2)"]}
        />
        <span>寝たきり度(A1)</span><input
          type="text"
          bind:value={dataMap["寝たきり度(A1)"]}
        />
        <span>寝たきり度(A2)</span><input
          type="text"
          bind:value={dataMap["寝たきり度(A2)"]}
        />
        <span>寝たきり度(B1)</span><input
          type="text"
          bind:value={dataMap["寝たきり度(B1)"]}
        />
        <span>寝たきり度(B2)</span><input
          type="text"
          bind:value={dataMap["寝たきり度(B2)"]}
        />
        <span>寝たきり度(C1)</span><input
          type="text"
          bind:value={dataMap["寝たきり度(C1)"]}
        />
        <span>寝たきり度(C2)</span><input
          type="text"
          bind:value={dataMap["寝たきり度(C2)"]}
        />
        <span>認知症の状況(Ｉ)</span><input
          type="text"
          bind:value={dataMap["認知症の状況(Ｉ)"]}
        />
        <span>認知症の状況(IIa)</span><input
          type="text"
          bind:value={dataMap["認知症の状況(IIa)"]}
        />
        <span>認知症の状況(IIb)</span><input
          type="text"
          bind:value={dataMap["認知症の状況(IIb)"]}
        />
        <span>認知症の状況(IIIa)</span><input
          type="text"
          bind:value={dataMap["認知症の状況(IIIa)"]}
        />
        <span>認知症の状況(IIIb)</span><input
          type="text"
          bind:value={dataMap["認知症の状況(IIIb)"]}
        />
        <span>認知症の状況(IV)</span><input
          type="text"
          bind:value={dataMap["認知症の状況(IV)"]}
        />
        <span>認知症の状況(Ｍ)</span><input
          type="text"
          bind:value={dataMap["認知症の状況(Ｍ)"]}
        />
        <span>要介護認定の状況（自立）</span><input
          type="text"
          bind:value={dataMap["要介護認定の状況（自立）"]}
        />
        <span>要介護認定の状況（要支援1）</span><input
          type="text"
          bind:value={dataMap["要介護認定の状況（要支援1）"]}
        />
        <span>要介護認定の状況（要支援2）</span><input
          type="text"
          bind:value={dataMap["要介護認定の状況（要支援2）"]}
        />
        <span>要介護認定の状況（要介護1）</span><input
          type="text"
          bind:value={dataMap["要介護認定の状況（要介護1）"]}
        />
        <span>要介護認定の状況（要介護2）</span><input
          type="text"
          bind:value={dataMap["要介護認定の状況（要介護2）"]}
        />
        <span>要介護認定の状況（要介護3）</span><input
          type="text"
          bind:value={dataMap["要介護認定の状況（要介護3）"]}
        />
        <span>要介護認定の状況（要介護4）</span><input
          type="text"
          bind:value={dataMap["要介護認定の状況（要介護4）"]}
        />
        <span>要介護認定の状況（要介護5）</span><input
          type="text"
          bind:value={dataMap["要介護認定の状況（要介護5）"]}
        />
        <span>褥瘡の深さ(3)</span><input
          type="text"
          bind:value={dataMap["褥瘡の深さ(3)"]}
        />
        <span>褥瘡の深さ(4)</span><input
          type="text"
          bind:value={dataMap["褥瘡の深さ(4)"]}
        />
        <span>褥瘡の深さ(D3)</span><input
          type="text"
          bind:value={dataMap["褥瘡の深さ(D3)"]}
        />
        <span>褥瘡の深さ(D4)</span><input
          type="text"
          bind:value={dataMap["褥瘡の深さ(D4)"]}
        />
        <span>褥瘡の深さ(D5)</span><input
          type="text"
          bind:value={dataMap["褥瘡の深さ(D5)"]}
        />
        <span>自動腹膜灌流装置</span><input
          type="text"
          bind:value={dataMap["自動腹膜灌流装置"]}
        />
        <span>透析液供給装置</span><input
          type="text"
          bind:value={dataMap["透析液供給装置"]}
        />
        <span>酸素療法</span><input
          type="text"
          bind:value={dataMap["酸素療法"]}
        />
        <span>酸素療法流速</span><input
          type="text"
          bind:value={dataMap["酸素療法流速"]}
        />
        <span>吸引器</span><input type="text" bind:value={dataMap["吸引器"]} />
        <span>中心静脈栄養</span><input
          type="text"
          bind:value={dataMap["中心静脈栄養"]}
        />
        <span>輸液ポンプ</span><input
          type="text"
          bind:value={dataMap["輸液ポンプ"]}
        />
        <span>経管栄養</span><input
          type="text"
          bind:value={dataMap["経管栄養"]}
        />
        <span>経管栄養経鼻</span><input
          type="text"
          bind:value={dataMap["経管栄養経鼻"]}
        />
        <span>経管栄養胃ろう</span><input
          type="text"
          bind:value={dataMap["経管栄養胃ろう"]}
        />
        <span>経管栄養チューブサイズ</span><input
          type="text"
          bind:value={dataMap["経管栄養チューブサイズ"]}
        />
        <span>経管栄養交換日</span><input
          type="text"
          bind:value={dataMap["経管栄養交換日"]}
        />
        <span>留置カテーテル</span><input
          type="text"
          bind:value={dataMap["留置カテーテル"]}
        />
        <span>留置カテーテルサイズ</span><input
          type="text"
          bind:value={dataMap["留置カテーテルサイズ"]}
        />
        <span>留置カテーテル交換日</span><input
          type="text"
          bind:value={dataMap["留置カテーテル交換日"]}
        />
        <span>人工呼吸器</span><input
          type="text"
          bind:value={dataMap["人工呼吸器"]}
        />
        <span>人工呼吸器陽圧式</span><input
          type="text"
          bind:value={dataMap["人工呼吸器陽圧式"]}
        />
        <span>人工呼吸器陰圧式</span><input
          type="text"
          bind:value={dataMap["人工呼吸器陰圧式"]}
        />
        <span>人工呼吸器設定</span><input
          type="text"
          bind:value={dataMap["人工呼吸器設定"]}
        />
        <span>気管カニューレ</span><input
          type="text"
          bind:value={dataMap["気管カニューレ"]}
        />
        <span>気管カニューレサイズ</span><input
          type="text"
          bind:value={dataMap["気管カニューレサイズ"]}
        />
        <span>人工肛門</span><input
          type="text"
          bind:value={dataMap["人工肛門"]}
        />
        <span>人工膀胱</span><input
          type="text"
          bind:value={dataMap["人工膀胱"]}
        />
        <span>装置その他マーク</span><input
          type="text"
          bind:value={dataMap["装置その他マーク"]}
        />
        <span>装置その他</span><input
          type="text"
          bind:value={dataMap["装置その他"]}
        />
        <span>留意事項</span><input
          type="text"
          bind:value={dataMap["留意事項"]}
        />
        <span>留意事項：リハビリテーションマーク</span><input
          type="text"
          bind:value={dataMap["留意事項：リハビリテーションマーク"]}
        />
        <span>留意事項：リハビリテーション</span><input
          type="text"
          bind:value={dataMap["留意事項：リハビリテーション"]}
        />
        <span>留意事項：褥瘡の処置などマーク</span><input
          type="text"
          bind:value={dataMap["留意事項：褥瘡の処置などマーク"]}
        />
        <span>留意事項：褥瘡の処置など</span><input
          type="text"
          bind:value={dataMap["留意事項：褥瘡の処置など"]}
        />
        <span>留意事項：装置マーク</span><input
          type="text"
          bind:value={dataMap["留意事項：装置マーク"]}
        />
        <span>留意事項：装置</span><input
          type="text"
          bind:value={dataMap["留意事項：装置"]}
        />
        <span>留意事項：その他マーク</span><input
          type="text"
          bind:value={dataMap["留意事項：その他マーク"]}
        />
        <span>留意事項：その他</span><input
          type="text"
          bind:value={dataMap["留意事項：その他"]}
        />
        <span>点滴指示</span><input
          type="text"
          bind:value={dataMap["点滴指示"]}
        />
        <span>緊急時の連絡先</span><input
          type="text"
          bind:value={dataMap["緊急時の連絡先"]}
        />
        <span>不在時の対応法</span><input
          type="text"
          bind:value={dataMap["不在時の対応法"]}
        />
        <span>特記すべき留意事項</span><input
          type="text"
          bind:value={dataMap["特記すべき留意事項"]}
        />
        <span>他の訪問看護ステーションへの指示：無</span><input
          type="text"
          bind:value={dataMap["他の訪問看護ステーションへの指示：無"]}
        />
        <span>他の訪問看護ステーションへの指示：有</span><input
          type="text"
          bind:value={dataMap["他の訪問看護ステーションへの指示：有"]}
        />
        <span>他の訪問看護ステーションへの指示：ステーション名</span><input
          type="text"
          bind:value={dataMap[
            "他の訪問看護ステーションへの指示：ステーション名"
          ]}
        />
        <span>たんの吸引等実施のための訪問介護事業所への指示：無</span><input
          type="text"
          bind:value={dataMap[
            "たんの吸引等実施のための訪問介護事業所への指示：無"
          ]}
        />
        <span>たんの吸引等実施のための訪問介護事業所への指示：有</span><input
          type="text"
          bind:value={dataMap[
            "たんの吸引等実施のための訪問介護事業所への指示：有"
          ]}
        />
        <span
          >たんの吸引等実施のための訪問介護事業所への指示：指定訪問介護事業所名</span
        ><input
          type="text"
          bind:value={dataMap[
            "たんの吸引等実施のための訪問介護事業所への指示：指定訪問介護事業所名"
          ]}
        />
        <span>発行日（元号）</span><input
          type="text"
          bind:value={dataMap["発行日（元号）"]}
        />
        <span>発行日（年）</span><input
          type="text"
          bind:value={dataMap["発行日（年）"]}
        />
        <span>発行日（月）</span><input
          type="text"
          bind:value={dataMap["発行日（月）"]}
        />
        <span>発行日（日）</span><input
          type="text"
          bind:value={dataMap["発行日（日）"]}
        />
        <span>医療機関名</span><input
          type="text"
          bind:value={dataMap["医療機関名"]}
        />
        <span>医療機関（住所）</span><input
          type="text"
          bind:value={dataMap["医療機関（住所）"]}
        />
        <span>医療機関（電話）</span><input
          type="text"
          bind:value={dataMap["医療機関（電話）"]}
        />
        <span>医療機関（ＦＡＸ）</span><input
          type="text"
          bind:value={dataMap["医療機関（ＦＡＸ）"]}
        />
        <span>医師氏名</span><input
          type="text"
          bind:value={dataMap["医師氏名"]}
        />
        <span>提出先</span><input type="text" bind:value={dataMap["提出先"]} />
      </div>
    </div>
  </div>
  <div class="dev-wrapper">
    <div>
      <button on:click={doDataInterface}>データインターフェイス</button>
    </div>
    <div>
      <button on:click={doDataMap}>データマップ</button>
    </div>
    <div>
      <button on:click={doDataInputs}>データインプット</button>
    </div>
  </div>
{/if}

<style>
  .title {
    font-size: 1.5rem;
    margin-bottom: 10px;
  }

  .title-input {
    width: 20em;
  }

  .title-selector-link {
    cursor: pointer;
    position: relative;
    top: 4px;
  }

  .title-input-choice-wrapper {
    width: fit-content;
    margin: 3px 10px;
    padding: 0 10px;
  }

  .title-input-choice {
    cursor: pointer;
  }

  .title-input-choice:hover {
    background-color: #ccc;
  }

  .send-to-input {
    width: 20em;
  }

  .data-source-wrapper {
    display: grid;
    grid-template-columns: 4em 26em;
  }

  .data-source-wrapper textarea {
    width: 100%;
    height: 10em;
  }

  .data-source-errors {
    color: red;
    border: 1px solid red;
    margin: 4px 10;
    padding: 10px;
  }

  .data-inputs {
    height: 40em;
    overflow: auto;
    display: grid;
    grid-template-columns: 20em 20em;
    gap: 4px 1em;
    padding: 10px;
    border: 1px solid gray;
    margin: 10px;
  }

  .dev-wrapper {
    margin-top: 10px;
  }
</style>
