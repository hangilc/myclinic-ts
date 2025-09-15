<script lang="ts">
  import type { SymptomContracture } from "@/lib/drawer/forms/ryouyouhi-douisho/ryouyouhi-douisho-drawer";
  import EditableText from "./EditableText.svelte";

  export let values: SymptomContracture;
</script>

<div>
  <div class="title">症状（関節拘縮）</div>
  <div class="section">
    <div class="subtitle">右側</div>
    <div class="checkbox-group">
      <label>
        <input type="checkbox" bind:checked={values["右肩"]} />
        右肩
      </label>
      <label>
        <input type="checkbox" bind:checked={values["右肘"]} />
        右肘
      </label>
      <label>
        <input type="checkbox" bind:checked={values["右手首"]} />
        右手首
      </label>
      <label>
        <input type="checkbox" bind:checked={values["右股関節"]} />
        右股関節
      </label>
      <label>
        <input type="checkbox" bind:checked={values["右膝"]} />
        右膝
      </label>
      <label>
        <input type="checkbox" bind:checked={values["右足首"]} />
        右足首
      </label>
    </div>
  </div>

  <div class="section">
    <div class="subtitle">左側</div>
    <div class="checkbox-group">
      <label>
        <input type="checkbox" bind:checked={values["左肩"]} />
        左肩
      </label>
      <label>
        <input type="checkbox" bind:checked={values["左肘"]} />
        左肘
      </label>
      <label>
        <input type="checkbox" bind:checked={values["左手首"]} />
        左手首
      </label>
      <label>
        <input type="checkbox" bind:checked={values["左股関節"]} />
        左股関節
      </label>
      <label>
        <input type="checkbox" bind:checked={values["左膝"]} />
        左膝
      </label>
      <label>
        <input type="checkbox" bind:checked={values["左足首"]} />
        左足首
      </label>
    </div>
  </div>

  <div class="section">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="other-label">
      その他: <EditableText bind:value={values["その他"]} placeholder={"その他の関節拘縮"} />
      <!-- <input type="text" bind:value={values["その他"]} placeholder="その他の関節拘縮" /> -->
    </label>
  </div>
</div>

<style>
  .title {
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .section {
    margin-bottom: 1rem;
  }

  .subtitle {
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-left: 1rem;
  }

  label {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  input[type="checkbox"] {
    margin-right: 0.5rem;
  }

  .other-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  input[type="text"] {
    flex: 1;
    max-width: 300px;
    padding: 0.25rem 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
</style>