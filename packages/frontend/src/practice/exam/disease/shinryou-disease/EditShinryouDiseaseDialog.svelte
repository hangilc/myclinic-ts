<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import type { ShinryouDisease } from "@/lib/shinryou-disease";

  export let destroy: () => void;
  export let title: string;
  export let shinryouName: string;
  export let onEnter: (item: ShinryouDisease) => void;
  let diseaseName = "";
  let kind: "disease-check" | "no-check" = "disease-check";
  let fixInput = "";

  function doEnter() {
    shinryouName = shinryouName.trim();
    if( shinryouName !== "" ){
      if( kind === "disease-check" ){
        destroy();
        let fix: undefined | { diseaseName: string; adjNames: string[] } = undefined;
        if( fixInput !== "" ){
          const parts = fixInput.split(/\s+/);
          if( parts.length === 0 ){
            alert("Ｆｉｘの入力が不適切ですｄ。");
            throw new Error("invalid fix input");
          }
          const [diseaseName, ...adjNames] = parts;
          fix = { diseaseName, adjNames };
        }
        onEnter({
          shinryouName,
          kind,
          diseaseName,
          fix,
        });
      } else if( kind === "no-check" ){
        destroy();
        onEnter({
          shinryouName,
          kind,
        })
      }
    }
  }
</script>

<Dialog {title} {destroy} styleWidth="300px">
  <div class="row">
    診療名：<input type="text" bind:value={shinryouName} />
  </div>
  <div>
    <input type="radio" bind:group={kind} value="disease-check" /> 病名チェック
    <input type="radio" bind:group={kind} value="no-check" /> チェックなし
  </div>
  {#if kind === "disease-check"}
    <div class="row">
      傷病名：<input type="text" bind:value={diseaseName} />
    </div>
    <div class="row">
      Ｆｉｘ：<input type="text" bind:value={fixInput} />
      <div style="opacity:0.7;font-size:0.7em;margin:3px 0 0 3em">例１："糖尿病"　例２："糖尿病　の疑い"</div>
    </div>
  {/if}
  <div class="commands">
    <button
      on:click={doEnter}
      disabled={!(
        shinryouName &&
        ((kind === "disease-check" && diseaseName) || kind === "no-check")
      )}>入力</button
    >
  </div>
  <hr />
</Dialog>

<style>
  .row {
    margin: 4px 0;
  }

  .commands {
    margin: 10px 0;
  }
</style>
