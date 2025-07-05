<script lang="ts">
  import Link from "../../widgets/Link.svelte";
  import Field from "./Field.svelte";
  import FieldForm from "./FieldForm.svelte";
  import FieldTitle from "./FieldTitle.svelte";
  import Wrapper from "./Wrapper.svelte";
  import type { 薬品コード種別 } from "@/lib/denshi-shohou/denshi-shohou";

  export let 薬品コード種別: 薬品コード種別;
  export let ippanmeicode: string;
  export let onConvToIppanmei: () => void;
  export let visible = true;

  function hasIppanmei(
    薬品コード種別: 薬品コード種別,
    ippanmeicode: string,
  ): boolean {
    return (
      薬品コード種別 === "レセプト電算処理システム用コード" &&
      ippanmeicode !== ""
    );
  }

  function isIppanmei(薬品コード種別: 薬品コード種別): boolean {
    return 薬品コード種別 === "一般名コード";
  }
</script>

  <Field {visible}>
    <FieldTitle>一般名</FieldTitle>
    <FieldForm>
      {#if hasIppanmei(薬品コード種別, ippanmeicode)}
        <Link onClick={onConvToIppanmei}>一般名に</Link>
      {:else if isIppanmei(薬品コード種別)}
        <span>一般名</span>
      {:else}
        <span>一般名なし</span>
      {/if}
    </FieldForm>
  </Field>
