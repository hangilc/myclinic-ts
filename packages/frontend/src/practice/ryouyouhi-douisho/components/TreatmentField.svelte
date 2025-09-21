<script lang="ts">
  import type { Treatment } from "@/lib/drawer/forms/ryouyouhi-douisho/ryouyouhi-douisho-drawer";

  export let values: Treatment;
</script>

<div>
  <div class="title">施術の種類・施術部位</div>

  <div class="section">
    <div class="treatment-type">マッサージ</div>
    <div class="checkbox-group">
      <label>
        <input type="checkbox" bind:checked={values["マッサージ-躯幹"]} />
        躯幹
      </label>
      <label>
        <input type="checkbox" bind:checked={values["マッサージ-右上肢"]} />
        右上肢
      </label>
      <label>
        <input type="checkbox" bind:checked={values["マッサージ-左上肢"]} />
        左上肢
      </label>
      <label>
        <input type="checkbox" bind:checked={values["マッサージ-右下肢"]} />
        右下肢
      </label>
      <label>
        <input type="checkbox" bind:checked={values["マッサージ-左下肢"]} />
        左下肢
      </label>
    </div>
  </div>

  <div class="section">
    <div class="treatment-type">変形徒手矯正術</div>
    <div class="checkbox-group">
      <label>
        <input type="checkbox" bind:checked={values["変形徒手矯正術-右上肢"]} />
        右上肢
      </label>
      <label>
        <input type="checkbox" bind:checked={values["変形徒手矯正術-左上肢"]} />
        左上肢
      </label>
      <label>
        <input type="checkbox" bind:checked={values["変形徒手矯正術-右下肢"]} />
        右下肢
      </label>
      <label>
        <input type="checkbox" bind:checked={values["変形徒手矯正術-左下肢"]} />
        左下肢
      </label>
    </div>
  </div>
</div>

<style>
  .title {
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .section {
    margin-bottom: 1.5rem;
    padding: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background-color: #fafafa;
  }

  .treatment-type {
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: #333;
    font-size: 1.1em;
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
    padding: 0.25rem 0.5rem;
    border-radius: 3px;
    transition: background-color 0.2s;
  }

  label:hover {
    background-color: #f0f0f0;
  }

  input[type="checkbox"] {
    margin-right: 0.5rem;
    transform: scale(1.1);
  }

  /* input[type="checkbox"]:checked + span {
    font-weight: 500;
    color: #2563eb;
  } */
</style>