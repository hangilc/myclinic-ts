<script lang="ts">
  import type { Text } from "myclinic-model";
  import type { ShohouTextMemo } from "../text-memo";
  import { renderDrug } from "@/lib/denshi-shohou/presc-renderer";
  import { createPrescInfo } from "@/lib/denshi-shohou/presc-info";
  import { sign_presc } from "@/lib/hpki-api";
  import * as cache from "@/lib/cache";
  import type { RegisterResult } from "@/lib/denshi-shohou/shohou-interface";
  import api from "@/lib/api";
  import { createQrCode, registerPresc } from "@/lib/denshi-shohou/presc-api";
  import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";
  import { drawShohousen } from "@/lib/drawer/forms/shohousen/shohousen-drawer";
  import { create_data_from_denshi } from "@/lib/drawer/forms/shohousen/data-from-denshi";
  import { createQrCodeContent } from "@/lib/denshi-shohou/shohou-qrcode";

  export let text: Text;
  if( !text.memo ){
    throw new Error("empty text memo");
  }
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
      if (register.XmlMsg.MessageBody?.CsvCheckResultList) {
        let list = register.XmlMsg.MessageBody?.CsvCheckResultList;
        if (list.length > 0) {
          let ms = list.map((item) => item.ResultMessage).join("\n");
          alert(ms);
        }
      }
      memo.register = register;
      text.memo = JSON.stringify(memo);
      console.log("new text", text);
      await api.updateText(text);
    }
  }

  function doDispClick() {

  }

  async function doPrint() {
    const qrcode = await createQrCode(createQrCodeContent(memo.shohou));
    let data = create_data_from_denshi(memo.shohou);
    let ops = drawShohousen(data);
    const d: DrawerDialog = new DrawerDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        ops,
        width: 148,
        height: 210,
        scale: 3,
        kind: "shohousen",
        title: "処方箋印刷",
        stamp: qrcode,
        stampStyle: "position:absolute;left:90mm;top:3mm;height:15mm;width:15mm;",
        stampPrintOption: { left: 115, top: 188, width: 15, height: 15 },
      },
    });
  }

  async function doDelete() {
    if( memo.shohou.引換番号 == undefined ){
      await api.deleteText(text.textId);
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="disp" on:click={doDispClick}>
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
</div>
<div class="commands">
  {#if memo.shohou.引換番号 == undefined}
    <a href="javascript:void(0)" on:click={doDelete}>削除</a>
  {/if}
</div>
  <!-- <div class="commands">
    <a href="javascript:void(0)" on:click={doPrint}>印刷</a>
    <a href="javascript:void(0)" on:click={() => (showCommands = false)}
      >キャンセル</a
    >
  </div> -->

<style>
  .drugs-wrapper {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px;
  }
</style>
