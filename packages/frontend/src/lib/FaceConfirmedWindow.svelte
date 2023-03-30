<script lang="ts">
  import Floating from "@/lib/Floating.svelte";
  import type { OnshiResult } from "onshi-result";
  import * as kanjidate from "kanjidate";
  import { convertHankakuKatakanaToZenkakuHiragana } from "./zenkaku";
  import api from "./api";

  export let destroy: () => void;
  export let result: OnshiResult;
  const style = "width:300px;padding:6px;border:1px solid blue;opacity:1;background-color:white;left:100px;top:100px;"
  let yomi: string = result.messageBody.nameKana ? toZenkaku(result.messageBody.nameKana) : "";

  resolvePatient();

  function toZenkaku(s: string): string {
    return convertHankakuKatakanaToZenkakuHiragana(s);
  }

  function formatDate(s: string): string {
    return kanjidate.format(kanjidate.f2, s);
  }

  async function resolvePatient() {
    let result = await api.searchPatientSmart(yomi);
    console.log("result", yomi, result);
  }
</script>

<Floating title="顔認証完了" {destroy} {style}>
  <div class="content">
    <div class="info">
      <span>名前</span>
      <span>{result.messageBody.name ?? ""}</span>
      <span>よみ</span>
      <span>{yomi}</span>
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
