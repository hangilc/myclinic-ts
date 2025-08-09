<script lang="ts">
  import type { PrescInfoData, RP剤情報 } from "../denshi-shohou/presc-info";
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
  import { validatePrescinfoData } from "../validate-presc-info";
  import PrescAux from "./components/PrescAux.svelte";
  import EditValidUpto from "./components/EditValidUpto.svelte";
  import SubCommands from "./components/workarea/SubCommands.svelte";
  import EditBikou from "./components/EditBikou.svelte";
  import EditClinicalInfo from "./components/EditClinicalInfo.svelte";
  import EditExamInfo from "./components/EditExamInfo.svelte";
  import Paste from "./components/Paste.svelte";
  import PrevSearch from "./components/PrevSearch.svelte";
  import Example from "./components/Example.svelte";
  import { createBlankRP剤情報 } from "@/practice/presc-example/presc-example-helper";
  import { WorkareaService } from "./denshi-editor-dialog";
  import Workarea from "./components/workarea/Workarea.svelte";

  export let title: string;
  export let destroy: () => void;
  export let orig: PrescInfoData;
  export let patientId: number;
  export let at: string;
  export let onEnter: (presc: PrescInfoData) => void;
  let showValid: boolean = true;

  let data = PrescInfoDataEdit.fromObject(orig);
  let workareaService: WorkareaService = new WorkareaService();
  let wa: HTMLElement;
  let selectedGroupId = 0;
  let selectedDrugId = 0;
  let showSubCommands = false;

  function doCancel() {
    destroy();
  }

  async function doEnter() {
    let presc = data.toObject();
    let err = await validatePrescinfoData(presc);
    if (err) {
      alert(err);
      return;
    }
    destroy();
    onEnter(presc);
  }

  async function onDrugSelect(group: RP剤情報Edit, drug: 薬品情報Edit) {
    if (!(await workareaService.confirmForClear())) {
      return;
    }
    const edit = group.clone();
    let w: EditDrug = new EditDrug({
      target: wa,
      props: {
        destroy: () => workareaService.clear(),
        orig: group,
        data: edit,
        drugId: drug.id,
        at,
        onChange: () => {
          data.RP剤情報グループ = data.RP剤情報グループ.map((g) =>
            g.id === group.id ? edit : g,
          ).filter((g) => g.薬品情報グループ.length > 0);
          data = data;
        },
      },
    });
    workareaService.setClearByDestroy(() => {
      w.$destroy();
      selectedGroupId = 0;
      selectedDrugId = 0;
    });
    workareaService.setConfirmForClear(async (): Promise<boolean> => {
      if (edit.isEditing()) {
        alert("薬剤が編集中です");
        return false;
      }
      if (edit.isModified(group)) {
        let ok = confirm(
          "変更されて保存されていない薬剤があります。保存して進みますか？",
        );
        if (ok) {
          data.RP剤情報グループ = data.RP剤情報グループ.map((g) =>
            g.id === group.id ? edit : g,
          ).filter((g) => g.薬品情報グループ.length > 0);
          data = data;
          return true;
        } else {
          return false;
        }
      }
      return true;
    });
  }

  async function doValidUpto() {
    if (!(await workareaService.confirmForClear())) {
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
    workareaService.setClearByDestroy(w.$destroy);
    workareaService.setConfirmForClear(async (): Promise<boolean> {

    })
  }

  async function doBikouClick(record: 備考レコードEdit | undefined): void {
    if (!(await workareaService.confirmForClear())) {
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

  async function doEditClinicalInfo() {
    if (!(await workareaService.confirmForClear())) {
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

  async function doEditExamInfo(): void {
    if (!(await workareaService.confirmForClear())) {
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

  async function doPaste() {
    if (!(await workareaService.confirmForClear())) {
      return;
    }
    const w: Paste = new Paste({
      target: wa,
      props: {
        destroy: () => clearWorkarea && clearWorkarea(),
        onEnter: (value: RP剤情報Edit[]) => {
          data.RP剤情報グループ.push(...value);
          data = data;
        },
      },
    });
    clearWorkarea = () => {
      w.$destroy();
      clearWorkarea = undefined;
    };
  }

  async function doSearch() {
    if (!(await workareaService.confirmForClear())) {
      return;
    }
    const w: PrevSearch = new PrevSearch({
      target: wa,
      props: {
        destroy: () => clearWorkarea && clearWorkarea(),
        patientId,
        at,
        onEnter: async (value: RP剤情報[]) => {
          let edit = value.map((g) => RP剤情報Edit.fromObject(g));
          data.RP剤情報グループ.push(...edit);
          data = data;
        },
      },
    });
    clearWorkarea = () => {
      w.$destroy();
      clearWorkarea = undefined;
    };
  }

  async function doExample() {
    if (!(await workareaService.confirmForClear())) {
      return;
    }
    const w: Example = new Example({
      target: wa,
      props: {
        destroy: () => clearWorkarea && clearWorkarea(),
        onEnter: (value: RP剤情報Edit[]) => {
          data.RP剤情報グループ.push(...value);
          data = data;
        },
      },
    });
    clearWorkarea = () => {
      w.$destroy();
      clearWorkarea = undefined;
    };
  }

  async function doAdd() {
    if (!(await workareaService.confirmForClear())) {
      return;
    }
    const RP剤情報 = createBlankRP剤情報();
    const group = RP剤情報Edit.fromObject(RP剤情報);
    let w: EditDrug = new EditDrug({
      target: wa,
      props: {
        destroy: () => clearWorkarea && clearWorkarea(),
        group,
        drugId: group.薬品情報グループ[0].id,
        at,
        onChange: (value: RP剤情報Edit) => {
          data.RP剤情報グループ.push(value);
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
</script>

<Dialog2 {title} {destroy}>
  <div class="top">
    <div class="left">
      <Commands
        onAdd={doAdd}
        onEnter={doEnter}
        onSearch={doSearch}
        onCancel={doCancel}
        onPaste={doPaste}
        onExample={doExample}
        bind:showSubCommands
      />
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
