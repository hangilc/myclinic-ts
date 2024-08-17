<script lang="ts">
  import type { Text } from "myclinic-model";
  import type { ShohouTextMemo } from "../text-memo";
  import { renderDrug } from "@/lib/denshi-shohou/presc-renderer";
  import { createPrescInfo } from "@/lib/denshi-shohou/presc-info";
  import { sign_presc } from "@/lib/hpki-api";
  import * as cache from "@/lib/cache";
  import type { RegisterResult } from "@/lib/denshi-shohou/shohou-interface";
  import api from "@/lib/api";
  import { registerPresc } from "@/lib/denshi-shohou/presc-api";

  export let text: Text;
  let memo: ShohouTextMemo = JSON.parse(text.memo);
  let drugs = memo.shohou.RP剤情報グループ.map((group) => renderDrug(group));
  let isDenshi = false;

  async function doRegister() {
    if (!memo.register) {
      const shohou = createPrescInfo(memo.shohou);
      console.log("shohou", shohou);
      const signed = await sign_presc(shohou);
      const kikancode = await cache.getShohouKikancode();
      let result = await registerPresc(signed, kikancode, "1");
      console.log("result", result);
      let register: RegisterResult = JSON.parse(result);
      if( register.MessageBody?.CsvCheckResultList ){
        let list = register.MessageBody?.CsvCheckResultList;
        if( list.length > 0 ){
          let ms = list.map(item => item.ResultMessage).join("\n");
          alert(ms);
        }
      }
      memo.register = register;
      text.memo = JSON.stringify(memo);
      console.log("new text", text);
      await api.updateText(text);
    }
  }
</script>

<div>院外処方</div>
<div>Ｒｐ）</div>
<div class="drugs-wrapper">
  {#each drugs as drug, i}
    <div>{i + 1})</div>
    <div>
      {#each drug.drugs as d}
        <div>{d}</div>
      {/each}
      <div>{drug.usage} {drug.times}</div>
    </div>
  {/each}
</div>
<div>
  <input type="checkbox" bind:checked={isDenshi} />電子処方箋
</div>
<div>
  {#if !memo.register && isDenshi}
    <a href="javascript:void(0)" on:click={doRegister}>登録</a>
  {/if}
</div>

<style>
  .drugs-wrapper {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px;
  }
</style>
