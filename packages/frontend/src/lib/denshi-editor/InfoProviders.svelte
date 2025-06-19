<script lang="ts">
  import type { 提供診療情報レコードIndexed } from "./denshi-editor-types";

  export let 提供診療情報レコード: 提供診療情報レコードIndexed[];
</script>

{#each 提供診療情報レコード as rec (rec.id)}
  <div class="info">
    <span class="info-label">{rec.提供診療情報区分}：</span>
    <span class="info-value">{rec.提供診療情報}</span>
  </div>
{/each}