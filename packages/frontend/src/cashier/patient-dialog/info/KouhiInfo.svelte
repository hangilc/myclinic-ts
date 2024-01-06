<script lang="ts">
  import type { Kouhi, Patient } from "myclinic-model";
  import type { Hoken } from "../hoken";
  import { formatValidFrom, formatValidUpto } from "./misc";

  export let patient: Patient | null;
  export let hoken: Hoken;
  let usageCount: number = hoken.usageCount;
  let kouhi: Kouhi = hoken.asKouhi;

</script>

<div class="panel">
  {#if patient}
  <span>({patient.patientId})</span>
  <span>{patient.fullName(" ")}</span>
  {/if}
  <span>負担者番号</span>
  <span>{kouhi.futansha}</span>
  <span>受給者番号</span>
  <span>{kouhi.jukyuusha}</span>
  <span>期限開始</span>
  <span>{formatValidFrom(kouhi.validFrom)}</span>
  <span>期限終了</span>
  <span>{formatValidUpto(kouhi.validUpto)}</span>
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