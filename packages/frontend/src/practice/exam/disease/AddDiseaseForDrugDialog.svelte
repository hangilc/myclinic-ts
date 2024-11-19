<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import type {
    ByoumeiMaster,
    DiseaseData,
    DiseaseEnterData,
    ShuushokugoMaster,
  } from "myclinic-model";
  import RegisterDrugDiseaseDialog from "./RegisterDrugDiseaseDialog.svelte";
  import type { DrugDisease } from "@/lib/drug-disease";
  import type { Writable } from "svelte/store";
  import type { DiseaseEnv } from "./disease-env";

  export let destroy: () => void;
  export let drugName: string;
  export let env: Writable<DiseaseEnv | undefined>;
  // export let at: string;
  // export let patientId: number;
  export let onAdded: (d: DiseaseData) => void;
  export let onRegistered: () => void;
  let searchText = "";
  let byoumeiResult: ByoumeiMaster[] = [];
  let adjResult: ShuushokugoMaster[] = [];
  let byoumeiMaster: ByoumeiMaster | undefined = undefined;
  let adjMasters: ShuushokugoMaster[] = [];
  let searchMode: "master" | "adj" = "master";

  async function doSearch() {
    const t = searchText.trim();
    let at = $env?.lastVisit?.visitedAt.substring(0, 10);
    if (t !== "" && at) {
      if (searchMode === "master") {
        byoumeiResult = await api.searchByoumeiMaster(t, at);
      } else if (searchMode === "adj") {
        adjResult = await api.searchShuushokugoMaster(t, at);
      }
    }
  }

  function prefix(adjMasters: ShuushokugoMaster[]): string {
    return adjMasters
      .filter((m) => m.isPrefix)
      .map((m) => m.name)
      .join("");
  }

  function postfix(adjMasters: ShuushokugoMaster[]): string {
    return adjMasters
      .filter((m) => !m.isPrefix)
      .map((m) => m.name)
      .join("");
  }

  async function doAdd(): Promise<DiseaseData | undefined> {
    let patientId = $env?.patient.patientId;
    let at = $env?.lastVisit?.visitedAt.substring(0, 10);
    if (byoumeiMaster && patientId && at) {
      const data: DiseaseEnterData = {
        patientId: patientId,
        byoumeicode: byoumeiMaster.shoubyoumeicode,
        startDate: at,
        adjCodes: adjMasters.map((m) => m.shuushokugocode),
      };
      const diseaseId: number = await api.enterDiseaseEx(data);
      const d: DiseaseData = await api.getDiseaseEx(diseaseId);
      return d;
    } else {
      return undefined;
    }
  }

  async function doRegister() {
    if (byoumeiMaster) {
      const d: RegisterDrugDiseaseDialog = new RegisterDrugDiseaseDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          drugName,
          diseaseName: byoumeiMaster.name,
          pre: adjMasters.filter((m) => m.isPrefix).map((m) => m.name),
          post: adjMasters.filter((m) => !m.isPrefix).map((m) => m.name),
          onRegistered,
        },
      });
    }
  }

  async function doAddAndRegister() {
    const data = await doAdd();
    await doRegister();
    if( data ){
      onAdded(data);
    }
    destroy();
  }
</script>

<Dialog title="薬剤の病名追加" {destroy}>
  <div>{drugName}</div>
  <div>
    <span
      >{prefix(adjMasters)}{byoumeiMaster?.name ?? ""}{postfix(
        adjMasters
      )}</span
    >
  </div>
  <div>
    <button on:click={doAddAndRegister} disabled={byoumeiMaster === undefined}
      >追加・登録</button
    >
  </div>
  <div>
    <div>
      <input type="radio" value="master" bind:group={searchMode} />病名
      <input type="radio" value="adj" bind:group={searchMode} />修飾語
    </div>
    <form on:submit|preventDefault={doSearch}>
      <input type="text" bind:value={searchText} />
      <button type="submit">検索</button>
    </form>
    {#if searchMode === "master"}
      <div class="byoumei-result-wrapper">
        {#each byoumeiResult as result (result.shoubyoumeicode)}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            on:click={() => {
              byoumeiMaster = result;
            }}
          >
            {result.name}
          </div>
        {/each}
      </div>
    {:else if searchMode === "adj"}
      <div class="byoumei-result-wrapper">
        {#each adjResult as result (result.shuushokugocode)}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            on:click={() => {
              adjMasters = [...adjMasters, result];
            }}
          >
            {result.name}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</Dialog>

<style>
  .byoumei-result-wrapper {
    max-height: 10rem;
    overflow-y: auto;
  }

  .byoumei-result-wrapper > div {
    cursor: pointer;
    user-select: none;
  }
</style>
