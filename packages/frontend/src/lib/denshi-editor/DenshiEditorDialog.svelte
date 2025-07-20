<script lang="ts">
  import type {
    PrescInfoData,
  } from "../denshi-shohou/presc-info";
  import Dialog2 from "../Dialog2.svelte";
  import Commands from "./components/Commands.svelte";
  import CurrentPresc from "./components/CurrentPresc.svelte";
  import {
    PrescInfoDataEdit,
    RP剤情報Edit,
    備考レコードEdit,
    提供診療情報レコードEdit,
    検査値データ等レコードEdit,
    薬品情報Edit,
  } from "./denshi-edit";
  import EditDrug from "./components/EditDrug.svelte";
  import { validatePrescinfoData } from "./validate-presc-info";
  import PrescAux from "./components/PrescAux.svelte";
  import EditValidUpto from "./components/EditValidUpto.svelte";
  import SubCommands from "./components/workarea/SubCommands.svelte";
  import EditBikou from "./components/EditBikou.svelte";
  import EditClinicalInfo from "./components/EditClinicalInfo.svelte";
  import EditExamInfo from "./components/EditExamInfo.svelte";
  import Paste from "./components/Paste.svelte";

  export let title: string;
  export let destroy: () => void;
  export let orig: PrescInfoData;
  export let at: string;
  export let showValid: boolean = false;
  export let onEnter: (presc: PrescInfoData) => void;

  let data = PrescInfoDataEdit.fromObject(orig);
  let clearWorkarea: (() => void) | undefined = undefined;
  let wa: HTMLElement;
  let selectedGroupId = 0;
  let selectedDrugId = 0;
  let showSubCommands = false;

  function doCancel() {
    destroy();
  }

  function doEnter() {
    let presc = data.toObject();
    let err = validatePrescinfoData(presc);
    if (err) {
      alert(err);
      return;
    }
    destroy();
    onEnter(presc);
  }

  function onDrugSelect(group: RP剤情報Edit, drug: 薬品情報Edit) {
    if (!wa) {
      return;
    }
    if (clearWorkarea) {
      alert("現在編集中です。」");
      return;
    }
    let w: EditDrug = new EditDrug({
      target: wa,
      props: {
        destroy: () => clearWorkarea && clearWorkarea(),
        group,
        drugId: drug.id,
        at,
        onChange: (value: RP剤情報Edit) => {
          data.RP剤情報グループ = data.RP剤情報グループ.map((g) =>
            g.id === group.id ? value : g,
          ).filter((g) => g.薬品情報グループ.length > 0);
          data = data;
        },
      },
    });
    clearWorkarea = () => {
      w.$destroy();
      clearWorkarea = undefined;
      selectedGroupId = 0;
      selectedDrugId = 0;
    };
  }

  function doValidUpto() {
    if (!wa) {
      return;
    }
    if (clearWorkarea) {
      alert("現在編集中です。」");
      return;
    }
    const w: EditValidUpto = new EditValidUpto({
      target: wa,
      props: {
        validUpto: data.使用期限年月日,
        destroy: () => clearWorkarea && clearWorkarea(),
        onEnter: (value: string | undefined) => {
          data.使用期限年月日 = value;
          data = data;
        },
        onCancel: () => {},
      },
    });
    clearWorkarea = () => {
      w.$destroy();
      clearWorkarea = undefined;
    };
  }

  function doBikouClick(record: 備考レコードEdit | undefined): void {
    if (!wa) {
      return;
    }
    if (clearWorkarea) {
      alert("現在編集中です。」");
      return;
    }
    if (record) {
      record.isEditing = true;
    }
    const w: EditBikou = new EditBikou({
      target: wa,
      props: {
        destroy: () => clearWorkarea && clearWorkarea(),
        bikou: data.備考レコード,
        update: (value: 備考レコードEdit[] | undefined) => {
          data.備考レコード = value;
          data = data;
        },
      },
    });
    clearWorkarea = () => {
      w.$destroy();
      clearWorkarea = undefined;
    };
  }

  function doEditBikou(): void {
    doBikouClick(undefined);
  }

  function doEditClinicalInfo(): void {
    if (!wa) {
      return;
    }
    if (clearWorkarea) {
      alert("現在編集中です。」");
      return;
    }
    const w: EditClinicalInfo = new EditClinicalInfo({
      target: wa,
      props: {
        destroy: () => clearWorkarea && clearWorkarea(),
        info: data.提供情報レコード?.提供診療情報レコード,
        update: (value: 提供診療情報レコードEdit[] | undefined) => {
          data.set提供診療情報レコード(value);
          data = data;
        },
      },
    });
    clearWorkarea = () => {
      w.$destroy();
      clearWorkarea = undefined;
    };
  }

  function doClinicalInfoClick(record: 提供診療情報レコードEdit): void {
    record.isEditing = true;
    doEditClinicalInfo();
  }

  function doEditExamInfo(): void {
    if (!wa) {
      return;
    }
    if (clearWorkarea) {
      alert("現在編集中です。」");
      return;
    }
    const w: EditExamInfo = new EditExamInfo({
      target: wa,
      props: {
        destroy: () => clearWorkarea && clearWorkarea(),
        info: data.提供情報レコード?.検査値データ等レコード,
        update: (value: 検査値データ等レコードEdit[] | undefined) => {
          data.set検査値データ等レコード(value);
          data = data;
        },
      },
    });
    clearWorkarea = () => {
      w.$destroy();
      clearWorkarea = undefined;
    };
  }

  function doExamInfoClick(record: 検査値データ等レコードEdit): void {
    record.isEditing = true;
    doEditExamInfo();
  }

  function doPaste(): void {
    if (!wa) {
      return;
    }
    if (clearWorkarea) {
      alert("現在編集中です。」");
      return;
    }
    const w: Paste = new Paste({
      target: wa,
      props: {
        destroy: () => clearWorkarea && clearWorkarea(),
        at,
        onEnter: (value: RP剤情報Edit[]) => {
          data.RP剤情報グループ.push(...value);
          data = data;
        }
      },
    });
    clearWorkarea = () => {
      w.$destroy();
      clearWorkarea = undefined;
    };
  }
</script>

<Dialog2 {title} {destroy}>
  <div class="top">
    <div class="left">
      <Commands onEnter={doEnter} onCancel={doCancel} onPaste={doPaste} bind:showSubCommands />
      {#if showSubCommands}
        <SubCommands
          {data}
          onValidUpto={doValidUpto}
          onEditBikou={doEditBikou}
          onEditClinicalInfo={doEditClinicalInfo}
          onEditExamInfo={doEditExamInfo}
        />
      {/if}
      <CurrentPresc
        {data}
        {onDrugSelect}
        {showValid}
        bind:selectedGroupId
        bind:selectedDrugId
      />
      <PrescAux
        {data}
        onValidUptoClick={doValidUpto}
        onBikouClick={doBikouClick}
        onClinicalInfoClick={doClinicalInfoClick}
        onExamInfoClick={doExamInfoClick}
      />
    </div>
    <div class="workarea" bind:this={wa}></div>
  </div>
</Dialog2>

<style>
  .top {
    margin: 0 10px 10px 10px;
    width: 760px;
    height: 600px;
    display: grid;
    grid-template-columns: 50% 1fr;
    gap: 10px;
    padding: 0 10px 10px 10px;
    overflow-y: auto;
  }
</style>
