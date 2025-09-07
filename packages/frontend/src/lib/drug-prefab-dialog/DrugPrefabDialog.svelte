<script lang="ts">
  import Dialog2 from "../Dialog2.svelte";
  import DrugPrefabForm from "./DrugPrefabForm.svelte";

  export let destroy: () => void;
  export let editId: string | undefined = undefined;

  console.log("open DrugPrefabDialog");
</script>

<Dialog2 {destroy} title="処方例編集">
  <div class="form">
    <DrugPrefabForm destroy={destroy} {editId}/>
  </div>
</Dialog2>

<style>
  .form {
    padding: 10px;
    max-height: calc(100vh - 200px);
    overflow-y: auto;
    --drug-prefab-form-width: 800px;
  }
</style>

