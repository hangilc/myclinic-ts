<script lang="ts">
  import type {
    PrescInfoDataEdit,
    備考レコードEdit,
    提供診療情報レコードEdit,
    検査値データ等レコードEdit,
  } from "../denshi-edit";
  import BikouField from "./BikouField.svelte";
  import ClinicalInfoField from "./ClinicalInfoField.svelte";
  import ExamInfoField from "./ExamInfoField.svelte";
  import ValidUptoField from "./ValidUptoField.svelte";

  export let data: PrescInfoDataEdit;
  export let onValidUptoClick: () => void;
  export let onBikouClick: (record: 備考レコードEdit) => void;
  export let onClinicalInfoClick: (record: 提供診療情報レコードEdit) => void;
  export let onExamInfoClick: (record: 検査値データ等レコードEdit) => void;
</script>

<ValidUptoField
  bind:validUpto={data.使用期限年月日}
  onClick={onValidUptoClick}
/>
<BikouField bind:bikou={data.備考レコード} onClick={onBikouClick} />
<ClinicalInfoField
  info={data.提供情報レコード?.提供診療情報レコード}
  onClick={onClinicalInfoClick}
/>
<ExamInfoField
  info={data.提供情報レコード?.検査値データ等レコード}
  onClick={onExamInfoClick}
/>
