<script lang="ts">
  import api from "@/lib/api";
  import { pad } from "@/lib/pad";
  import { setFocus } from "@/lib/set-focus";
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import type { Patient } from "myclinic-model";
  import { writable, type Writable } from "svelte/store";
  import SelectItem from "@/lib/SelectItem.svelte";
  import MishuuExecDialog from "./MishuuExecDialog.svelte";

  export let destroy: () => void;
  let searchText: string = "";
  let searchResult: Patient[] = [];
  let selected: Writable<Patient | undefined> = writable(undefined);

  selected.subscribe(async (patient) => {
    if( patient == undefined ){
      return;
    }
    const list = await api.listMishuuForPatient(patient.patientId, 10);
    destroy();
    const d: MishuuExecDialog = new MishuuExecDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        patient,
        list: list.map(item => [item[0], item[1].charge])
      }
    })
  })

  async function doSearch() {
    let t = searchText.trim();
    if( t != "" ){
      let patients = await api.searchPatientSmart(t);
      searchResult = patients;
    }
  }
</script>

<SurfaceModal {destroy} title="未収処理（検索）">
  <div>患者検索</div>
  <form on:submit|preventDefault={doSearch}>
    <input type="text" bind:value={searchText} use:setFocus data-cy="mishuu-search-input"/>
    <button type="submit">検索</button>
  </form>
  <div class="result">
    {#each searchResult as patient (patient.patientId)}
      <SelectItem {selected} data={patient}>
        <span data-patient-id={patient.patientId}>({pad(patient.patientId, 4, "0")}) {patient.fullName()}</span>
      </SelectItem>
    {/each}
  </div>
</SurfaceModal>

<style>
  form {
    margin-top: 4px;
  }
  .result {
    height: 5rem;
    border: 1px solid gray;
    margin: 10px 0 6px 0;
    overflow-y: auto;
    padding: 6px;
  }
</style>