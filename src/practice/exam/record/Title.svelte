<script lang="ts">
  import type * as m from "../../../lib/model";
  import * as kanjidate from "kanjidate";

  export let visit: m.VisitEx;
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<div class="top">
  <span class="datetime">{kanjidate.format(kanjidate.f9, visit.visitedAt)}</span>
  <a href="javascript:void(0)">操作</a>
</div>

<style>
  .top {
    padding: 3px 6px;
    background-color: #eee;
    display: flex;
    align-items: center;
    justify-content:space-between;
    margin-bottom: 6px;
  }
  .datetime {
    font-weight: bold;
  }
</style>