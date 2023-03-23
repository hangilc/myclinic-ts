<script lang="ts">
  import type { ResultOfQualificationConfirmation } from "onshi-result/dist/ResultOfQualificationConfirmation";
  import { convertHankakuKatakanaToZenkakuHiraKana } from "./zenkaku";

  export let result: ResultOfQualificationConfirmation;
</script>

<div class="wrapper">
  <div>
    <span>氏名</span>
    <span>{result.name.replace("　", " ")}</span>
  </div>
  <div>
    <span>よみ</span>
    <span>{convertHankakuKatakanaToZenkakuHiraKana(result.nameKana ?? "")}</span
    >
  </div>
</div>

<style>
  .wrapper {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .wrapper > *:nth-child(odd) {
    margin-right: 10px;
  }
</style>
