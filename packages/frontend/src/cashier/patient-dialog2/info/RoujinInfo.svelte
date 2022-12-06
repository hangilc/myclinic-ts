<script lang="ts">
  import { toZenkaku } from "@/lib/zenkaku";
  import type { Roujin, Patient } from "myclinic-model";
  import type { Hoken } from "../hoken";
  import { formatValidFrom, formatValidUpto } from "./misc";

  export let patient: Patient;
  export let hoken: Hoken;
  let usageCount: number = hoken.usageCount;
  let roujin: Roujin = hoken.asRoujin;

</script>

<div class="panel">
  <span>({patient.patientId})</span>
  <span>{patient.fullName(" ")}</span>
  <span>市町村番号</span>
  <span>{roujin.shichouson}</span>
  <span>受給者番号</span>
  <span>{roujin.jukyuusha}</span>
  <span>負担割</span>
  <span>{toZenkaku(roujin.futanWari.toString())}割</span>
  <span>期限開始</span>
  <span>{formatValidFrom(roujin.validFrom)}</span>
  <span>期限終了</span>
  <span>{formatValidUpto(roujin.validUpto)}</span>
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