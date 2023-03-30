<script lang="ts">
  import Floating from "@/lib/Floating.svelte";
  import type { OnshiResult } from "onshi-result";
  import * as kanjidate from "kanjidate";

  export let destroy: () => void;
  export let result: OnshiResult;
  const style = "width:300px;padding:6px;border:1px solid blue;opacity:1;background-color:white;left:100px;top:100px;"

  function formatDate(s: string): string {
    return kanjidate.format(kanjidate.f2, s);
  }
</script>

<Floating title="顔認証完了" {destroy} {style}>
  <div class="content">
    <div class="info">
      <span>名前</span>
      <span>{result.messageBody.name ?? ""}</span>
      <span>よみ</span>
      <span>{result.messageBody.nameKana ?? ""}</span>
      <span>生年月日</span>
      <span>{formatDate(result.messageBody.resultList[0].birthdate)}</span>
    </div>
  </div>
</Floating>

<style>
  .content {
    background-color: white;
    opacity: 1;
    max-height: 300px;
    height: auto;
    overflow-y: auto;
  }

  .info {
    display: grid;
    grid-template-columns: auto 1fr;
    margin: 10px 0;
  }

  .info > *:nth-child(odd) {
    margin-right: 10px;
  }
</style>
