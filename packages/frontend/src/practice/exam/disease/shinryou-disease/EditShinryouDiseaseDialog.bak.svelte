<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import type { ShinryouDisease } from "@/lib/shinryou-disease";
  import type { ByoumeiMaster, ShuushokugoMaster } from "myclinic-model";

  export let destroy: () => void;
  export let title: string;
  export let shinryouName: string;
  export let at: string;
  export let orig: ShinryouDisease | undefined = undefined;
  export let onEnter: (item: ShinryouDisease) => void;
  let kind: "disease-check" | "no-check" | "multi-disease-check" = "disease-check";
  let diseaseCheckInputs: {
    diseaseName: string;
    fixDiseaseName: string;
    fixAdjNames: string[];
  } = {
    diseaseName: "",
    fixDiseaseName: "",
    fixAdjNames: [],
  };
  let searchMode: "byoumei" | "shuushokugo" = "byoumei";
  let searchText = "";
  let byoumeiResult: ByoumeiMaster[] = [];
  let adjResult: ShuushokugoMaster[] = [];

  if( orig !== undefined ){
    if( orig.kind === "disease-check" ){
      diseaseCheckInputs = {
        diseaseName: orig.diseaseName,
        fixDiseaseName: orig.fix ? orig.fix.diseaseName : "",
        fixAdjNames: orig.fix ? orig.fix.adjNames : [],
      }
    }
  }

  function doEnter() {
    shinryouName = shinryouName.trim();
    if (shinryouName !== "") {
      switch (kind) {
        case "no-check": {
          destroy();
          onEnter({
            shinryouName,
            kind,
          });
          break;
        }
        case "disease-check": {
          const inputs = diseaseCheckInputs;
          if (inputs.diseaseName === "") {
            alert("病名が設定されていません。");
            return;
          }
          let fix: { diseaseName: string; adjNames: string[] } | undefined =
            undefined;
          if (inputs.fixDiseaseName === "" && inputs.fixAdjNames.length > 0) {
            alert("Ｆｉｘ病名が設定されていません。");
            return;
          }
          if (inputs.fixDiseaseName !== "") {
            fix = {
              diseaseName: inputs.fixDiseaseName,
              adjNames: inputs.fixAdjNames,
            };
          }
          destroy();
          onEnter({
            shinryouName,
            kind,
            diseaseName: inputs.diseaseName,
            fix,
          });
        }
      }
    }
  }

  async function doSearch() {
    searchText = searchText.trim();
    if (searchText !== "") {
      byoumeiResult = [];
      adjResult = [];
      if (searchMode === "byoumei") {
        byoumeiResult = await api.searchByoumeiMaster(searchText, at);
      } else if (searchMode === "shuushokugo") {
        adjResult = await api.searchShuushokugoMaster(searchText, at);
      }
    }
  }

  function doByoumeiSelect(m: ByoumeiMaster) {
    if (kind === "disease-check") {
      diseaseCheckInputs.diseaseName = m.name;
      diseaseCheckInputs.fixDiseaseName = m.name;
      diseaseCheckInputs = diseaseCheckInputs;
      searchText = "";
      searchMode = "shuushokugo";
      byoumeiResult = [];
    }
  }

  function doAdjSelect(m: ShuushokugoMaster) {
    if (kind === "disease-check") {
      diseaseCheckInputs.fixAdjNames.push(m.name);
      diseaseCheckInputs = diseaseCheckInputs;
      adjResult = [];
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
  {#if kind === "disease-check" || kind === "multi-disease-check" }
    <div class="row">
      傷病名：{diseaseCheckInputs.diseaseName}
    </div>
    <div class="row">
      Ｆｉｘ：{[
        diseaseCheckInputs.fixDiseaseName,
        ...diseaseCheckInputs.fixAdjNames,
      ].join("　")}
    </div>
  {/if}
  <div class="commands">
    <button
      on:click={doEnter}
      disabled={!(
        shinryouName &&
        ((kind === "disease-check" &&
          diseaseCheckInputs.diseaseName !== "" &&
          ((diseaseCheckInputs.fixDiseaseName === "" &&
            diseaseCheckInputs.fixAdjNames.length === 0) ||
            diseaseCheckInputs.fixDiseaseName !== "")) ||
          kind === "no-check")
      )}>入力</button
    >
  </div>
  {#if kind === "disease-check"}
    <hr />
    <form on:submit|preventDefault={doSearch}>
      <input type="radio" value="byoumei" bind:group={searchMode} /> 病名
      <input type="radio" value="shuushokugo" bind:group={searchMode} /> 修飾語
      <input type="text" bind:value={searchText} />
      <button type="submit">検索</button>
    </form>
    <div style="margin-top:10px;">
      {#if byoumeiResult.length > 0}
        {#each byoumeiResult as m (m.shoubyoumeicode)}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div on:click={() => doByoumeiSelect(m)} style="cursor:pointer;">{m.name}</div>
        {/each}
      {/if}
      {#if adjResult.length > 0}
        {#each adjResult as m (m.shuushokugocode)}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div on:click={() => doAdjSelect(m)} style="cursor:pointer;">{m.name}</div>
        {/each}
      {/if}
    </div>
  {/if}
</Dialog>

<style>
  .row {
    margin: 4px 0;
  }

  .commands {
    margin: 10px 0;
  }
</style>
