<script lang="ts">
  import type { IyakuhinMaster, KizaiMaster } from "myclinic-model";
  import SearchLink from "../icons/SearchLink.svelte";
  import "../widgets/style.css";
  import api from "@/lib/api";
  import { cache, type DrugNameBind } from "@/lib/cache";
  import { onMount } from "svelte";
  import type { ConvAux4 } from "./denshi-conv";
  import type {
    情報区分,
    薬品コード種別,
  } from "@/lib/denshi-shohou/denshi-shohou";
  import Link from "../widgets/Link.svelte";
  import type { 薬品補足レコード } from "@/lib/denshi-shohou/presc-info";
  import {
    index薬品補足レコード,
    unindex薬品補足レコード,
    type 薬品補足レコードIndexed,
  } from "../denshi-editor-types";
  import Hosoku from "../drug-form/Hosoku.svelte";
  import DrugAmount from "../DrugAmount.svelte";
  import { unconvDrugRep } from "../helper";
  import type { Drug } from "@/lib/parse-shohou";
  import Wrapper from "./workarea/Wrapper.svelte";
  import Title from "./workarea/Title.svelte";
  import OrigDrug from "./workarea/OrigDrug.svelte";
  import DrugKindField from "./workarea/DrugKindField.svelte";
  import DrugAmountField from "./workarea/DrugAmountField.svelte";
  import DrugHosokuField from "./workarea/DrugHosokuField.svelte";
  import DrugIppanField from "./workarea/DrugIppanField.svelte";

  export let onDone: () => void;
  export let at: string;
  export let onResolved: (
    resolved: ConvAux4,
    薬品補足レコード: 薬品補足レコード[],
  ) => void;
  export let 情報区分: 情報区分 = "医薬品";
  export let 薬品コード種別: 薬品コード種別 =
    "レセプト電算処理システム用コード";
  export let 薬品コード: string = "";
  export let 薬品名称: string;
  export let 分量: string;
  export let 単位名: string;
  export let 薬品補足レコード: 薬品補足レコードIndexed[];
  export let src: Drug;
  let isDrugKindEditing = 薬品コード === "";
  let isDrugAmountEditing = 分量 === "";
  let isHosokuEditing = 薬品補足レコード.some(r => r.isEditing);
  let searchText = 薬品名称;
  let searchResult: IyakuhinMaster[] = [];
  let searchKizaiResult: KizaiMaster[] = [];
  let inputElement: HTMLInputElement;
  let cacheUpdateKey: string = 薬品名称;
  let cacheUpdateData: DrugNameBind | undefined = undefined;
  let ippanmei: string = "";
  let ippanmeicode: string = "";
  let suppls: 薬品補足レコードIndexed[] = 薬品補足レコード.map((r) =>
    index薬品補足レコード(r),
  );
  let isEditingAmount = false;

  function isAllSet(
    情報区分: 情報区分 | undefined,
    薬品コード種別: 薬品コード種別 | undefined,
    薬品コード: string | undefined,
    単位名: string | undefined,
  ): boolean {
    return (
      情報区分 !== undefined &&
      薬品コード種別 !== undefined &&
      薬品コード !== undefined &&
      単位名 !== undefined
    );
  }

  function doEnter() {
    if (
      情報区分 !== undefined &&
      薬品コード種別 !== undefined &&
      薬品コード !== undefined &&
      単位名 !== undefined
    ) {
      if (cacheUpdateData) {
        updateCache(cacheUpdateKey, cacheUpdateData);
      }
      onDone();
      onResolved(
        {
          情報区分,
          薬品コード種別,
          薬品コード,
          薬品名称,
          単位名,
        },
        suppls.map((r) => unindex薬品補足レコード(r)),
      );
    }
  }

  async function updateCache(
    name: string,
    bind: DrugNameBind
  ) {
    try {
      // Update the cache with the new drug name -> iyakuhin code mapping
      const currentMap = await cache.getDrugNameIyakuhincodeMap();
      const updatedMap = { ...currentMap };
      updatedMap[name] = bind;
      await cache.setDrugNameIyakuhincodeMap(updatedMap);
    } catch (error) {
      console.error("Failed to update drug cache:", error);
      // Continue with the selection even if cache update fails
    }
  }

  // function doSelect(master: IyakuhinMaster) {
  //   情報区分 = "医薬品";
  //   薬品コード種別 = "レセプト電算処理システム用コード";
  //   薬品コード = master.iyakuhincode.toString();
  //   薬品名称 = master.name;
  //   単位名 = master.unit;
  //   ippanmei = master.ippanmei || "";
  //   ippanmeicode = master.ippanmeicode || "";
  //   cacheUpdateData = master.iyakuhincode;
  //   searchText = "";
  //   searchResult = [];
  // }

  // function doKizaiSelect(master: KizaiMaster) {
  //   情報区分 = "医療材料";
  //   薬品コード種別 = "レセプト電算処理システム用コード";
  //   薬品コード = master.kizaicode.toString();
  //   薬品名称 = master.name;
  //   単位名 = master.unit;
  //   ippanmei = "";
  //   ippanmeicode = "";
  //   cacheUpdateData = {
  //     kind: "kizai",
  //     kizaicode: master.kizaicode,
  //   };
  //   searchText = "";
  //   searchKizaiResult = [];
  // }

  function doIppanmei() {
    if (ippanmei && ippanmeicode) {
      薬品コード種別 = "一般名コード";
      薬品コード = ippanmeicode;
      薬品名称 = ippanmei;
      cacheUpdateData = {
        kind: "ippanmei",
        name: ippanmei,
        code: ippanmeicode,
      };
    }
  }

  onMount(() => {});

  function doAddHosoku() {
    suppls.push(index薬品補足レコード({ 薬品補足情報: "" }));
    suppls = suppls;
  }

  function doChange情報区分(kubun: 情報区分) {
    情報区分 = kubun;
  }

  function doConvToIppanmei() {}
</script>

<Wrapper>
  <Title>薬剤の解決</Title>
  <OrigDrug drug={src}></OrigDrug>
  <DrugKindField
    bind:薬品名称
    bind:薬品コード
    bind:薬品コード種別
    {at}
    {情報区分}
    bind:isEditing={isDrugKindEditing}
  />
  <DrugIppanField
    {薬品コード種別}
    {ippanmeicode}
    visible={情報区分 === "医薬品"}
    onConvToIppanmei={doConvToIppanmei}
  />
  <DrugAmountField bind:分量 bind:isEditing={isEditingAmount} {単位名} />
  <DrugHosokuField bind:薬品補足レコード={suppls} visible={suppls.length > 0} />
  <div class="commands">
    {#if 情報区分 === "医薬品"}
      <Link onClick={() => doChange情報区分("医療材料")}>器材選択</Link>
    {:else}
      <Link onClick={() => doChange情報区分("医薬品")}>薬品選択</Link>
    {/if}
    {#if ippanmei && ippanmeicode}
      <Link onClick={doIppanmei}>一般名に</Link>
    {/if}
    <Link onClick={doAddHosoku}>補足追加</Link>
    {#if isAllSet(情報区分, 薬品コード種別, 薬品コード, 単位名)}
      <button on:click={doEnter}>入力</button>
    {/if}
    <button on:click={onDone}>キャンセル</button>
  </div>
</Wrapper>

<style>
</style>
