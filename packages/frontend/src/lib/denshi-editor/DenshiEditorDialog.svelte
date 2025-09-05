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
  import {
    createBlank薬品情報,
    createEmptyRP剤情報,
  } from "@/lib/denshi-shohou/presc-info-helper";
  import { WorkareaService } from "./denshi-editor-dialog";
  import GroupReorder from "./components/GroupReorder.svelte";
  import DrugReorder from "./components/DrugReorder.svelte";
  import KouhiRep from "./components/KouhiRep.svelte";
  import { KouhiSet } from "./kouhi-set";
  import ChooseKouhi from "./components/ChooseKouhi.svelte";
  import EditGroup from "./components/EditGroup.svelte";
  import {
    initIsEditingOfDrug,
    initIsEditingUsage,
  } from "./helper";
  import { createEmpty薬品情報 } from "../denshi-helper";
  import DrugPrefabDialog from "../drug-prefab-dialog/DrugPrefabDialog.svelte";
  import DrugNameConvDialog from "../drug-name-conv/DrugNameConvDialog.svelte";
  import DrugUsageConvDialog from "../drug-usage-conv/DrugUsageConvDialog.svelte";

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
  let showSubCommands = false;

  function doCancel() {
    destroy();
  }

  async function doEnter() {
    if (!(await workareaService.confirmAndClear())) {
      return;
    }
    let presc = data.toObject();
    let err = await validatePrescinfoData(presc);
    if (err) {
      alert(err);
      return;
    }
    destroy();
    onEnter(presc);
  }

  function addOrphanGroup(group: RP剤情報Edit) {
    if (!data.hasRP剤情報(group.id)) {
      data.RP剤情報グループ.push(group);
    }
  }

  async function doGroupSelect(
    group: RP剤情報Edit,
    drug: 薬品情報Edit | undefined,
    opt: {
      isNewDrug: boolean
    } = { isNewDrug: false }
  ) {
    if (!(await workareaService.confirmAndClear())) {
      return;
    }
    group.isSelected = true;
    data = data;
    const orig = group.clone();
    let w: EditGroup = new EditGroup({
      target: wa,
      props: {
        group: group,
        drug,
        isNewDrug: opt.isNewDrug,
        at,
        kouhiSet: KouhiSet.fromPrescInfoData(data),
        onCancel: () => {
          data.RP剤情報グループ = data.RP剤情報グループ.map((g) =>
            g.id === group.id ? orig : g,
          );
          workareaService.clear();
        },
        onEnter: () => {
          addOrphanGroup(group);
          if (group.薬品情報グループ.length === 0) {
            data.RP剤情報グループ = data.RP剤情報グループ.filter(
              (g) => g.id !== group.id,
            );
          }
          workareaService.clear();
        },
      },
    });
    workareaService.setClearByDestroy(() => {
      w.$destroy();
      data.clearAllSelected();
      data = data;
    });
    workareaService.setConfirm(async (): Promise<boolean> => {
      const editingCauses: string[] = [];
      if (group.isEditing(editingCauses) || drug?.isEditing(editingCauses)) {
        // alert("薬品が編集中です");
        const ok = confirm("薬品が編集中ですがこのまま続けますか？\n" + editingCauses.join("・"));
        if( !ok ){
          return false;
        }
      }
      if (drug && !group.includesDrug(drug.id)) {
        // alert("追加されていない薬品があります。");
        const ok = confirm("追加されていない薬品がありますがこのまま続けますか・");
        if( !ok ){
          return false;
        }
      }
      if (group.isModified(orig)) {
        let ok = confirm(
          "変更されて保存されていない薬剤があります。保存して進みますか？",
        );
        if (ok) {
          addOrphanGroup(group);
          data.RP剤情報グループ = data.RP剤情報グループ.filter(
            (g) => g.薬品情報グループ.length > 0,
          );
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
    if (!(await workareaService.confirmAndClear())) {
      return;
    }
    const orig = data.使用期限年月日;
    const edit: { value: string | undefined } = { value: orig };
    const w: EditValidUpto = new EditValidUpto({
      target: wa,
      props: {
        validUpto: edit,
        destroy: () => workareaService.clear(),
        onEnter: () => {
          data.使用期限年月日 = edit.value;
          data = data;
        },
      },
    });
    workareaService.setClearByDestroy(() => {
      w.$destroy();
    });
    workareaService.setConfirm(async (): Promise<boolean> => {
      if (orig === edit.value) {
        return true;
      } else {
        const proceed = confirm(
          "有効期限が変更されています。保存して続けますか？",
        );
        if (proceed) {
          data.使用期限年月日 = edit.value;
          data = data;
          return true;
        } else {
          return false;
        }
      }
    });
  }

  async function doBikouClick(record: 備考レコードEdit) {
    if (!(await workareaService.confirmAndClear())) {
      return;
    }
    record.isEditing = true;
    const w: EditBikou = new EditBikou({
      target: wa,
      props: {
        destroy: () => workareaService.clear(),
        bikou: data.備考レコード,
        update: (value: 備考レコードEdit[] | undefined) => {
          data.備考レコード = value;
          data = data;
        },
      },
    });
    workareaService.setClearByDestroy(() => w.$destroy());
    workareaService.setConfirm(async (): Promise<boolean> => {
      alert("備考が編集中です。");
      return false;
    });
  }

  function doAddBikou(): void {
    const record = 備考レコードEdit.fromBikou("");
    if (data.備考レコード === undefined) {
      data.備考レコード = [];
    }
    data.備考レコード.push(record);
    doBikouClick(record);
  }

  async function doEditClinicalInfo(record: 提供診療情報レコードEdit) {
    if (!(await workareaService.confirmAndClear())) {
      return;
    }
    record.isEditing = true;
    const w: EditClinicalInfo = new EditClinicalInfo({
      target: wa,
      props: {
        destroy: () => workareaService.clear(),
        info: data.提供情報レコード?.提供診療情報レコード,
        update: (value: 提供診療情報レコードEdit[] | undefined) => {
          data.set提供診療情報レコード(value);
          data = data;
        },
      },
    });
    workareaService.setClearByDestroy(() => w.$destroy());
    workareaService.setConfirm(async (): Promise<boolean> => {
      alert("提供診療情報が編集中です。");
      return false;
    });
  }

  function doAddClinicalInfo(): void {
    const record = 提供診療情報レコードEdit.fromComment("");
    data.add提供診療情報レコード(record);
    doEditClinicalInfo(record);
  }

  async function doEditExamInfo(record: 検査値データ等レコードEdit) {
    if (!(await workareaService.confirmAndClear())) {
      return;
    }
    record.isEditing = true;
    const w: EditExamInfo = new EditExamInfo({
      target: wa,
      props: {
        destroy: () => workareaService.clear(),
        info: data.提供情報レコード?.検査値データ等レコード,
        update: (value: 検査値データ等レコードEdit[] | undefined) => {
          data.set検査値データ等レコード(value);
          data = data;
        },
      },
    });
    workareaService.setClearByDestroy(() => w.$destroy());
    workareaService.setConfirm(async (): Promise<boolean> => {
      alert("検査値データ等レコードが編集中です。");
      return false;
    });
  }

  function doAddExamInfo(): void {
    const record = 検査値データ等レコードEdit.fromData("");
    data.add検査値データ等レコード(record);
    doEditExamInfo(record);
  }

  async function doPaste() {
    if (!(await workareaService.confirmAndClear())) {
      return;
    }
    const edit: { inputValue: string } = { inputValue: "" };
    const w: Paste = new Paste({
      target: wa,
      props: {
        edit,
        destroy: () => workareaService.clear(),
        onEnter: (value: RP剤情報Edit[]) => {
          data.RP剤情報グループ.push(...value);
          data = data;
        },
      },
    });
    workareaService.setClearByDestroy(() => w.$destroy());
    workareaService.setConfirm(async (): Promise<boolean> => {
      if (edit.inputValue === "") {
        return true;
      }
      alert("薬剤の貼付けの実行中です。");
      return false;
    });
  }

  async function doSearch() {
    if (!(await workareaService.confirmAndClear())) {
      return;
    }
    const w: PrevSearch = new PrevSearch({
      target: wa,
      props: {
        destroy: () => workareaService.clear(),
        patientId,
        at,
        onEnter: async (value: RP剤情報[]) => {
          let edit = value.map((g) => RP剤情報Edit.fromObject(g));
          data.RP剤情報グループ.push(...edit);
          data = data;
        },
      },
    });
    workareaService.setClearByDestroy(() => w.$destroy());
    workareaService.setConfirm(async (): Promise<boolean> => {
      return true;
    });
  }

  async function doExample() {
    if (!(await workareaService.confirmAndClear())) {
      return;
    }
    const w: Example = new Example({
      target: wa,
      props: {
        destroy: () => workareaService.clear(),
        onEnter: (value: RP剤情報) => {
          const edit = RP剤情報Edit.fromObject(value);
          data.RP剤情報グループ.push(edit);
          data = data;
        },
      },
    });
    workareaService.setClearByDestroy(() => w.$destroy());
    workareaService.setConfirm(async (): Promise<boolean> => {
      return true;
    });
  }

  async function doAdd() {
    const group = RP剤情報Edit.fromObject(createEmptyRP剤情報());
    const drug = 薬品情報Edit.fromObject(createEmpty薬品情報());
    initIsEditingUsage(group);
    initIsEditingOfDrug(drug);
    doGroupSelect(group, drug, { isNewDrug: true });
  }

  function doAddDrugToGroup(group: RP剤情報Edit) {
    const 薬品情報 = 薬品情報Edit.fromObject(createBlank薬品情報());
    initIsEditingOfDrug(薬品情報);
    // 薬品情報.薬品レコード.isEditing薬品コード = false;
    // 薬品情報.薬品レコード.isEditing分量 = false;
    group.薬品情報グループ.push(薬品情報);
    doGroupSelect(group, 薬品情報);
  }

  async function doGroupReorder() {
    if (!(await workareaService.confirmAndClear())) {
      return;
    }
    let w: GroupReorder = new GroupReorder({
      target: wa,
      props: {
        groups: data.RP剤情報グループ,
        onEnter: (groups: RP剤情報Edit[]) => {
          data.RP剤情報グループ = groups;
          workareaService.clear();
          data = data;
        },
        onCancel: () => {
          workareaService.clear();
        },
      },
    });
    workareaService.setClearByDestroy(() => w.$destroy());
    workareaService.setConfirm(async (): Promise<boolean> => true);
  }

  async function doDrugReorder(group: RP剤情報Edit) {
    if (!(await workareaService.confirmAndClear())) {
      return;
    }
    let w: DrugReorder = new DrugReorder({
      target: wa,
      props: {
        drugs: group.薬品情報グループ,
        onCancel: () => workareaService.clear(),
        onEnter: (ordered: 薬品情報Edit[]) => {
          group.薬品情報グループ = ordered;
          data = data;
          workareaService.clear();
        },
      },
    });
    workareaService.setClearByDestroy(() => w.$destroy());
    workareaService.setConfirm(async (): Promise<boolean> => true);
  }

  async function doChooseKouhi() {
    if (!(await workareaService.confirmAndClear())) {
      return;
    }
    const save: RP剤情報Edit[] = data.RP剤情報グループ.map((drug) =>
      drug.clone(),
    );
    let w: ChooseKouhi = new ChooseKouhi({
      target: wa,
      props: {
        kouhiSet: KouhiSet.fromPrescInfoData(data),
        groups: data.RP剤情報グループ,
        onCancel: () => {
          data.RP剤情報グループ = save;
          workareaService.clear();
        },
        onEnter: () => workareaService.clear(),
      },
    });
    workareaService.setClearByDestroy(() => w.$destroy());
    workareaService.setConfirm(async (): Promise<boolean> => true);
  }

  function doGroupManip(_group: RP剤情報Edit) {}

  function doDrugNameConvEditor() {
    const d: DrugNameConvDialog = new DrugNameConvDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
      }
    })
  }

  function doDrugUsageConvEditor() {
    const d: DrugUsageConvDialog = new DrugUsageConvDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
      }
    })
  }

  function doDrugPrefabEditor() {
    const d: DrugPrefabDialog = new DrugPrefabDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
      }
    })
  }

  function wrapSubCommand(f: () => void): () => void {
    return () => {
      showSubCommands = false;
      f();
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
          onValidUpto={wrapSubCommand(doValidUpto)}
          onAddBikou={wrapSubCommand(doAddBikou)}
          onAddClinicalInfo={wrapSubCommand(doAddClinicalInfo)}
          onAddExamInfo={wrapSubCommand(doAddExamInfo)}
          onReorder={wrapSubCommand(doGroupReorder)}
          onChooseKouhi={wrapSubCommand(doChooseKouhi)}
          onDrugNameConvEditor={wrapSubCommand(doDrugNameConvEditor)}
          onDrugUsageConvEditor={wrapSubCommand(doDrugUsageConvEditor)}
          onDrugPrefabEditor={wrapSubCommand(doDrugPrefabEditor)}
        />
      {/if}
      <CurrentPresc
        {data}
        onDrugSelect={(group, drug) => doGroupSelect(group, drug)}
        onUsageAndTimesSelect={(group) => doGroupSelect(group, undefined)}
        onGroupSelect={(group) => doGroupManip(group)}
        {showValid}
        onAddDrug={doAddDrugToGroup}
        onDrugReorder={doDrugReorder}
      />
      <PrescAux
        {data}
        onValidUptoClick={doValidUpto}
        onBikouClick={doBikouClick}
        onClinicalInfoClick={doEditClinicalInfo}
        onExamInfoClick={doEditExamInfo}
      />
      <KouhiRep kouhiSet={KouhiSet.fromPrescInfoData(orig)} />
    </div>
    <div class="workarea" bind:this={wa}></div>
  </div>
</Dialog2>

<style>
  .top {
    margin: 0 10px 10px 10px;
    width: 760px;
    max-height: calc(100vh - 160px);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    padding: 0 10px 10px 10px;
    overflow-y: auto;
  }
</style>
