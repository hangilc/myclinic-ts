<script lang="ts">
  import type { 公費レコード } from "@/lib/denshi-shohou/presc-info";
  import { kouhiRep } from "@/lib/hoken-rep";
  import type { KouhiSet } from "../kouhi-set";

  export let kouhiSet: KouhiSet;

  function rep(kouhi: 公費レコード): string {
    const futansha = kouhi.公費負担者番号;
    return `${kouhiRep(futansha)}（${futansha}）`;
  }
</script>

<div>
  {#if kouhiSet.kouhi1}
    {kouhiSet.kouhi1Label()}：{rep(kouhiSet.kouhi1)}
  {/if}
  {#if kouhiSet.kouhi2}
    第二公費：{rep(kouhiSet.kouhi2)}
  {/if}
  {#if kouhiSet.kouhi3}
    第三公費：{rep(kouhiSet.kouhi3)}
  {/if}
  {#if kouhiSet.kouhiSpecial}
    特殊公費：{rep(kouhiSet.kouhiSpecial)}
  {/if}
</div>
