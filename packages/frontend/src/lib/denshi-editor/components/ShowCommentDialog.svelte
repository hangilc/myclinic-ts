<script lang="ts">
  import Dialog2 from "@/lib/Dialog2.svelte";
  import type { DrugPrefab } from "@/lib/drug-prefab";
  import { drugRep } from "../helper";

  export let destroy: () => void;
  export let prefabs: DrugPrefab[];
</script>

<Dialog2 title="薬剤コメント" {destroy}>
  <div class="content">
    {#each prefabs as prefab, index}
      <div class="prefab-item">
        <!-- <div class="drug-name">
          {prefab.presc.薬品情報グループ[0].薬品レコード.薬品名称}
        </div> -->
        <div class="drug-rep">
          {drugRep(prefab.presc.薬品情報グループ[0])}
        </div>
        {#if prefab.comment}
          <div class="comment">
            {prefab.comment}
          </div>
        {:else}
          <div class="no-comment">コメントなし</div>
        {/if}
        {#if index < prefabs.length - 1}
          <hr class="separator" />
        {/if}
      </div>
    {/each}
    {#if prefabs.length === 0}
      <div class="no-data">表示するコメントがありません</div>
    {/if}
  </div>
</Dialog2>

<style>
  .content {
    padding: 16px;
    max-width: 500px;
    max-height: 400px;
    overflow-y: auto;
  }

  .prefab-item {
    margin-bottom: 12px;
  }

  .drug-rep {
    color: #666;
    margin: 10px 0;
    font-weight: bold;
  }

  .comment {
    color: #666;
    line-height: 1.4;
    white-space: pre-wrap;
  }

  .no-comment {
    color: #999;
    font-style: italic;
  }

  .separator {
    border: none;
    border-top: 1px solid #e0e0e0;
    margin: 12px 0;
  }

  .no-data {
    text-align: center;
    color: #999;
    padding: 20px;
  }
</style>