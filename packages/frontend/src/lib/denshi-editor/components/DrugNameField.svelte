<script lang="ts">
  import type { IyakuhinMaster, KizaiMaster } from "myclinic-model";
  import {
    不均等レコードEdit,
    薬品補足レコードEdit,
    type 薬品情報Edit,
  } from "../denshi-edit";
  import CancelLink from "../icons/CancelLink.svelte";
  import EraserLink from "../icons/EraserLink.svelte";
  import SearchLink from "../icons/SearchLink.svelte";
  import Field from "./workarea/Field.svelte";
  import FieldForm from "./workarea/FieldForm.svelte";
  import FieldTitle from "./workarea/FieldTitle.svelte";
  import api from "@/lib/api";
  import { tick } from "svelte";
  import SmallLink from "./workarea/SmallLink.svelte";
  import {
    createIyakuhinResultFromIppanmei,
    createIyakuhinResultFromMaster,
    createIyakuhinResultFromPrefab,
    iyakuhinResultRep,
    type SearchIyakuhinResult,
  } from "./drug-name-field/drug-name-field-types";
  import { searchDrugPrefab, type DrugPrefab } from "@/lib/drug-prefab";
  import { cache } from "@/lib/cache";
  import type { RP剤情報, 薬品情報 } from "@/lib/denshi-shohou/presc-info";
  import { toHankaku, toZenkaku } from "@/lib/zenkaku";

  export let drug: 薬品情報Edit;
  export let isNewDrug: boolean;
  export let isEditing: boolean;
  export let at: string;
  export let onDrugChange: () => void;
  export let onGroupChangeRequest: (req: (g: RP剤情報) => void) => void;
  export const focus: () => void = async () => {
    await tick();
    inputElement?.focus();
  };
  // export let onPrefab: (prefab: PrescOfPrefab) => void;
  let searchText = drug.薬品レコード.薬品名称;
  let inputElement: HTMLInputElement;
  let searchIyakuhinResult: SearchIyakuhinResult[] = [];
  let searchKizaiResult: KizaiMaster[] = [];

  function doRepClick() {
    searchText = drug.薬品レコード.薬品名称;
    isEditing = true;
    focus();
  }

  async function findIyakuhinMaster(
    iyakuhincode: number,
  ): Promise<IyakuhinMaster | undefined> {
    try {
      return await api.getIyakuhinMaster(iyakuhincode, at);
    } catch {
      return undefined;
    }
  }

  async function resolvePrefabMaster(
    prefab: DrugPrefab,
  ): Promise<IyakuhinMaster | undefined> {
    const name = prefab.presc.薬品情報グループ[0].薬品レコード.薬品名称;
    if (name.startsWith("【般】")) {
      const ms = await api.listIyakuhinMasterByIppanmei(
        prefab.presc.薬品情報グループ[0].薬品レコード.薬品名称,
        at,
      );
      let rs = ms.filter((m) => m.senteiRyouyouKubun !== 2);
      if (ms.length > 0) {
        let r = rs.filter((m) => m.kouhatsu === "0")[0];
        return r || rs[0];
      } else {
        return undefined;
      }
    } else {
      return findIyakuhinMaster(
        parseInt(prefab.presc.薬品情報グループ[0].薬品レコード.薬品コード),
      );
    }
  }

  async function doSearch() {
    let t = searchText.trim();
    if (t !== "") {
      // const drugNameAlias = await cache.getDrugNameAlias();
      if (drug.薬品レコード.情報区分 === "医薬品") {
        searchIyakuhinResult = [];
        const drugPrefabList = await cache.getDrugPrefabList();
        const prefabs = searchDrugPrefab(drugPrefabList, t);
        const prefabMasters: [DrugPrefab, IyakuhinMaster | undefined][] =
          await Promise.all(
            prefabs.map(async (pre) => {
              const master = await resolvePrefabMaster(pre);
              return [pre, master];
            }),
          );
        prefabMasters.forEach(([fab, m]) => {
          if (m && m.senteiRyouyouKubun !== 2) {
            searchIyakuhinResult.push(createIyakuhinResultFromPrefab(fab, m));
          }
        });
        if (t.startsWith("【般】")) {
          let rs = await api.listIyakuhinMasterByIppanmei(t, at);
          rs = rs.filter((m) => m.senteiRyouyouKubun !== 2);
          if (rs.length > 0) {
            searchIyakuhinResult.push(createIyakuhinResultFromIppanmei(rs[0]));
            searchIyakuhinResult.push(
              ...rs.map(createIyakuhinResultFromMaster),
            );
          }
        } else {
          let msResult = await api.searchIyakuhinMaster(t, at);
          msResult = msResult.filter((m) => m.senteiRyouyouKubun !== 2);
          msResult.forEach((m) =>
            searchIyakuhinResult.push(createIyakuhinResultFromMaster(m)),
          );
        }
        searchIyakuhinResult = searchIyakuhinResult;
      } else if (drug.薬品レコード.情報区分 === "医療材料") {
        searchKizaiResult = await api.searchKizaiMaster(t, at);
      }
    } else {
      searchIyakuhinResult = [];
      searchKizaiResult = [];
    }
  }

  function doClearSearchText() {
    searchText = "";
    focus();
  }

  function doCancel() {
    isEditing = false;
  }

  function fixUnitConv(
    drugName: string,
    origAmount: string,
    origUnit: string,
    newUnit: string,
  ):
    | {
        newAmount: string;
        suppls: string[];
      }
    | undefined {
    console.log("enter fixUnitConv", drugName, origAmount, origUnit, newUnit);
    const packUnitMatch = /^(.+)(mL|ｍＬ|g|ｇ)$/.exec(drugName);
    if (!packUnitMatch) {
      return undefined;
    }
    const packUnit: string = toZenkaku(packUnitMatch[2]);
    if (packUnit !== newUnit) {
      return undefined;
    }
    const packAmountMatch = /([0-9０-９.．]+)$/.exec(packUnitMatch[1]);
    if (!packAmountMatch) {
      return undefined;
    }
    const packAmount = Number(toHankaku(packAmountMatch[1]));
    if (isNaN(packAmount)) {
      return undefined;
    }
    if (origUnit === "包" || origUnit === "本") {
      const origAmountValue: number = Number(toHankaku(origAmount));
      if (isNaN(origAmountValue)) {
        return undefined;
      }
      const total = packAmount * origAmountValue;
      const suppl = `${toZenkaku(packAmount.toString())}${packUnit}${toZenkaku(origAmount)}${toZenkaku(origUnit)}`;
      return { newAmount: toZenkaku(total.toString()), suppls: [suppl] };
    }
    return undefined;
  }

  function handleUnitConv(origDrugName: string, origUnit: string, newUnit: string) {
    if (!isNewDrug && origUnit !== "" && origUnit !== newUnit) {
      if (drug.薬品レコード.分量 === "") {
        drug.薬品レコード.単位名 = newUnit;
      } else {
        const fix = fixUnitConv(
          origDrugName,
          drug.薬品レコード.分量,
          origUnit,
          newUnit,
        );
        if (fix) {
          drug.薬品レコード.分量 = fix.newAmount;
          drug.薬品レコード.単位名 = newUnit;
          console.log("before fix drug", typeof drug, drug);
          fix.suppls.forEach((suppl) => drug.addDrugSupplText(suppl));
          console.log("fixed drug", drug);
        } else {
          alert(
            `単位名を現在のもの（${origUnit}）からマスターレコードの単位名（${newUnit}）に変更しました`,
          );
        }
      }
    }
  }

  function setByMaster(
    m: IyakuhinMaster,
    _isNewDrug: boolean,
    ippanmei: boolean,
  ) {
    const origName = drug.薬品レコード.薬品名称;
    const origUnit = drug.薬品レコード.単位名;
    Object.assign(drug.薬品レコード, {
      薬品コード種別: ippanmei
        ? "一般名コード"
        : "レセプト電算処理システム用コード",
      薬品コード: ippanmei ? m.ippanmeicode : m.iyakuhincode.toString(),
      薬品名称: ippanmei ? m.ippanmei : m.name,
      単位名: m.unit,
    });
    handleUnitConv(origName, origUnit, m.unit);
    drug.ippanmei = m.ippanmei;
    drug.ippanmeicode = m.ippanmeicode;
  }

  function setByPrefab(
    prefab: DrugPrefab,
    master: IyakuhinMaster,
    _isNewDrug: boolean,
  ) {
    const origName = drug.薬品レコード.薬品名称;
    const origUnit = drug.薬品レコード.単位名;
    const prefabDrugRecord = prefab.presc.薬品情報グループ[0].薬品レコード;
    Object.assign(
      drug.薬品レコード,
      {
        薬品コード種別: prefabDrugRecord.薬品コード種別,
        薬品コード: prefabDrugRecord.薬品コード,
        薬品名称: prefabDrugRecord.薬品名称,
        単位名: prefabDrugRecord.単位名,
      },
      {
        isEditing情報区分: false,
        isEditing薬品コード: false,
        isEditing分量: false,
      },
    );
    if (isNewDrug) {
      drug.薬品レコード.分量 = prefabDrugRecord.分量;
    }
    const prefabUnit = prefab.presc.薬品情報グループ[0].薬品レコード.単位名;
    handleUnitConv(origName, origUnit, prefabUnit);
    drug.ippanmei = master.ippanmei;
    drug.ippanmeicode = master.ippanmeicode;
    // onPrefab(prefab.presc);
    if (isNewDrug) {
      const prefabDrug: 薬品情報 = prefab.presc.薬品情報グループ[0];
      drug.不均等レコード = prefabDrug.不均等レコード
        ? 不均等レコードEdit.fromObject(prefabDrug.不均等レコード)
        : undefined;
      drug.薬品補足レコード = prefabDrug.薬品補足レコード?.map((sup) =>
        薬品補足レコードEdit.fromObject(sup),
      );
      onGroupChangeRequest((g: RP剤情報) => {
        Object.assign(g, {
          剤形レコード: prefab.presc.剤形レコード,
          用法レコード: prefab.presc.用法レコード,
          用法補足レコード: prefab.presc.用法補足レコード,
        });
      });
    }
  }

  function doIyakuhinMasterSelect(item: SearchIyakuhinResult) {
    if (item.kind === "master") {
      setByMaster(item.master, isNewDrug, false);
    } else if (item.kind === "prefab") {
      setByPrefab(item.prefab, item.master, isNewDrug);
    } else if (item.kind === "ippanmei") {
      setByMaster(item.master, isNewDrug, true);
    }
    searchText = "";
    searchIyakuhinResult = [];
    isEditing = false;
    onDrugChange();
  }

  function doKizaiMasterSelect(m: KizaiMaster) {
    Object.assign(drug.薬品レコード, {
      薬品コード種別: "レセプト電算処理システム用コード",
      薬品コード: m.kizaicode.toString(),
      薬品名称: m.name,
      単位名: m.unit,
    });
    drug.ippanmei = "";
    drug.ippanmeicode = "";
    searchText = "";
    searchKizaiResult = [];
    isEditing = false;
    onDrugChange();
  }

  function convertToIppanmei() {
    drug.convertToIppanmei();
    isEditing = false;
    drug = drug;
    onDrugChange();
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<Field>
  <FieldTitle>薬品名称</FieldTitle>
  <FieldForm>
    {#if !isEditing}
      <div>
        <span class="rep" on:click={doRepClick}
          >{drug.薬品レコード.薬品名称 || "（未設定）"}
          {#if drug.薬品レコード.薬品コード === ""}
            （コードなし）
          {/if}
        </span>
        {#if drug.isConvertibleToIppanmei()}
          <SmallLink onClick={convertToIppanmei}>一般名に</SmallLink>
        {/if}
      </div>
    {:else}
      <div class="with-icons">
        <form on:submit|preventDefault={doSearch}>
          <input
            type="text"
            tabindex="0"
            bind:value={searchText}
            bind:this={inputElement}
            class="search-text"
          />
        </form>
        <SearchLink onClick={doSearch} />
        <EraserLink onClick={doClearSearchText} />
        <CancelLink onClick={doCancel} />
      </div>
    {/if}
    {#if drug.薬品レコード.情報区分 === "医薬品" && searchIyakuhinResult.length > 0}
      <div class="search-result">
        {#each searchIyakuhinResult as item (item.id)}
          <div
            class="search-result-item"
            on:click={() => doIyakuhinMasterSelect(item)}
          >
            {iyakuhinResultRep(item, isNewDrug)}
          </div>
        {/each}
      </div>
    {:else if drug.薬品レコード.情報区分 === "医療材料" && searchKizaiResult.length > 0}
      <div class="search-result">
        {#each searchKizaiResult as master (master.kizaicode)}
          <div
            class="search-result-item"
            on:click={() => doKizaiMasterSelect(master)}
          >
            {master.name}
          </div>
        {/each}
      </div>
    {/if}
  </FieldForm>
</Field>

<style>
  .rep {
    cursor: pointer;
  }

  .search-text {
    width: 18em;
  }

  .with-icons {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .search-result {
    height: 10em;
    overflow-y: auto;
    resize: vertical;
    font-size: 14px;
    margin-top: 6px;
    border: 1px solid gray;
  }

  .search-result-item {
    cursor: pointer;
  }

  .search-result-item:hover {
    background-color: #eee;
  }
</style>
