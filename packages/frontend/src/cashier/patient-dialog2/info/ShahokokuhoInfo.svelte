<script lang="ts">
  import type { Patient, Shahokokuho } from "myclinic-model";
  import type { Hoken } from "../hoken";
  import { toZenkaku } from "@/lib/zenkaku";
  import { formatValidFrom, formatValidUpto } from "./misc";

  export let patient: Patient;
  export let hoken: Hoken;
  let shahokokuho: Shahokokuho = hoken.asShahokokuho;
  let usageCount: number = hoken.usageCount;
  
  function formatKourei(kourei: number): string {
    if (kourei === 0) {
      return "高齢でない";
    } else {
      return `${toZenkaku(kourei.toString())}割`;
    }
  }

</script>

<div class="panel">
  <span>({patient.patientId})</span>
  <span>{patient.fullName(" ")}</span>
  <span>保険者番号</span>
  <span>{shahokokuho.hokenshaBangou}</span>
  <span>記号・番号</span>
  <span>
    {#if shahokokuho.hihokenshaKigou !== ""}
      {shahokokuho.hihokenshaKigou}・
    {/if}
    {shahokokuho.hihokenshaBangou}
  </span>
  <span>枝番</span>
  <span>{shahokokuho.edaban}</span>
  <span>本人・家族</span>
  <span>{shahokokuho.honnninKazokuType.rep}</span>
  <span>期限開始</span>
  <span>{formatValidFrom(shahokokuho.validFrom)}</span>
  <span>期限終了</span>
  <span>{formatValidUpto(shahokokuho.validUpto)}</span>
  <span>高齢</span>
  <span>{formatKourei(shahokokuho.koureiStore)}</span>
  <span>使用回数</span>
  <span>{usageCount}回</span>
</div>

<style>
  .panel {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .panel > *:nth-child(odd) {
    display: flex;
    align-items: center;
    justify-content: right;
    margin-right: 6px;
  }
</style>

