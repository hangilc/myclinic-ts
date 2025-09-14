<script lang="ts">
  import type { SymptomWeakness } from "@/lib/drawer/forms/ryouyouhi-douisho/ryouyouhi-douisho-drawer";

  export let values: SymptomWeakness;
</script>

<div>
  <div class="title">症状（筋麻痺・筋委縮）</div>
  <div class="checkbox-group">
    <label>
      <input type="checkbox" bind:checked={values["躯幹"]} />
      躯幹
    </label>
    <label>
      <input type="checkbox" bind:checked={values["右上肢"]} />
      右上肢
    </label>
    <label>
      <input type="checkbox" bind:checked={values["左上肢"]} />
      左上肢
    </label>
    <label>
      <input type="checkbox" bind:checked={values["右下肢"]} />
      右下肢
    </label>
    <label>
      <input type="checkbox" bind:checked={values["左下肢"]} />
      左下肢
    </label>
  </div>
</div>

<style>
  .title {
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  label {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  input[type="checkbox"] {
    margin-right: 0.5rem;
  }
</style>