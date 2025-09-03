<script lang="ts">
  import Dialog2 from "../Dialog2.svelte";
  import DrugPrefabForm from "./DrugPrefabForm.svelte";

  export let destroy: () => void;

</script>

<Dialog2 {destroy} title="処方例編集">
  <div class="form">
    <DrugPrefabForm destroy={destroy}/>
  </div>
</Dialog2>

<style>
  .form {
    padding: 10px;
    --drug-prefab-form-width: 800px;
  }
</style>

